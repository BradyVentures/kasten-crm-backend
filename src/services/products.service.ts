import { db } from '../config/database.js';

export async function getCategories() {
  const result = await db.query(
    'SELECT * FROM product_categories WHERE is_active = true ORDER BY sort_order'
  );
  return result.rows;
}

export async function getCategoryBySlug(slug: string) {
  const catResult = await db.query(
    'SELECT * FROM product_categories WHERE slug = $1',
    [slug]
  );
  if (!catResult.rows[0]) return null;

  const category = catResult.rows[0];

  const attrsResult = await db.query(
    'SELECT * FROM product_attributes WHERE category_id = $1 ORDER BY sort_order',
    [category.id]
  );

  const attrIds = attrsResult.rows.map((a: { id: string }) => a.id);
  let options: { attribute_id: string }[] = [];
  if (attrIds.length > 0) {
    const optResult = await db.query(
      `SELECT * FROM product_attribute_options WHERE attribute_id = ANY($1) ORDER BY sort_order`,
      [attrIds]
    );
    options = optResult.rows;
  }

  const attributes = attrsResult.rows.map((attr: { id: string }) => ({
    ...attr,
    options: options.filter((o) => o.attribute_id === attr.id),
  }));

  return { ...category, attributes };
}

export async function calculatePrice(categorySlug: string, config: Record<string, string | number | boolean>) {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) throw new Error('Kategorie nicht gefunden');

  const rulesResult = await db.query(
    'SELECT * FROM pricing_rules WHERE category_id = $1 AND is_active = true',
    [category.id]
  );
  const rules = rulesResult.rows;

  const breakdown: { label: string; amount: number; type: string }[] = [];
  let totalPrice = 0;

  // 1. Base price (per m2)
  const baseRule = rules.find((r: { rule_type: string }) => r.rule_type === 'base_sqm');
  if (baseRule) {
    const width = Number(config.breite || config.width || 0) / 1000;
    const height = Number(config.hoehe || config.height || config.tiefe || config.depth || 0) / 1000;
    const sqm = width * height;
    const baseAmount = Math.round(sqm * parseFloat(baseRule.price) * 100) / 100;
    breakdown.push({ label: `Grundpreis (${sqm.toFixed(2)} m²)`, amount: baseAmount, type: 'base' });
    totalPrice += baseAmount;
  }

  // 2. Base unit price
  const unitRule = rules.find((r: { rule_type: string }) => r.rule_type === 'base_unit');
  if (unitRule) {
    const amount = parseFloat(unitRule.price);
    breakdown.push({ label: 'Grundpreis', amount, type: 'base' });
    totalPrice += amount;
  }

  // 3. Attribute surcharges from options
  for (const attr of category.attributes) {
    if (attr.attribute_type === 'select' && config[attr.slug]) {
      const selectedOption = attr.options.find((o: { value: string }) => o.value === config[attr.slug]);
      if (selectedOption && parseFloat(selectedOption.price_modifier) !== 0) {
        const mod = parseFloat(selectedOption.price_modifier);
        breakdown.push({ label: `${attr.label}: ${selectedOption.label}`, amount: mod, type: 'attribute' });
        totalPrice += mod;
      }
    }
    if (attr.attribute_type === 'boolean' && config[attr.slug] === true) {
      const surchargeRule = rules.find(
        (r: { rule_type: string; attribute_slug: string }) => r.rule_type === 'attribute_surcharge' && r.attribute_slug === attr.slug
      );
      if (surchargeRule) {
        const amount = parseFloat(surchargeRule.price);
        breakdown.push({ label: attr.label, amount, type: 'attribute' });
        totalPrice += amount;
      }
    }
  }

  // 4. Size surcharges
  const widthMm = Number(config.breite || config.width || 0);
  const heightMm = Number(config.hoehe || config.height || config.tiefe || 0);
  for (const rule of rules.filter((r: { rule_type: string }) => r.rule_type === 'size_surcharge')) {
    const matchW = (!rule.min_width || widthMm >= rule.min_width) && (!rule.max_width || widthMm <= rule.max_width);
    const matchH = (!rule.min_height || heightMm >= rule.min_height) && (!rule.max_height || heightMm <= rule.max_height);
    if (matchW && matchH) {
      const amount = parseFloat(rule.price);
      breakdown.push({ label: 'Groessenzuschlag', amount, type: 'surcharge' });
      totalPrice += amount;
    }
  }

  // 5. Minimum price
  const minRule = rules.find((r: { rule_type: string }) => r.rule_type === 'min_price');
  if (minRule && totalPrice < parseFloat(minRule.price)) {
    totalPrice = parseFloat(minRule.price);
    breakdown.push({ label: 'Mindestpreis', amount: parseFloat(minRule.price), type: 'base' });
  }

  totalPrice = Math.round(totalPrice * 100) / 100;

  // Generate product name
  const parts = [category.name];
  if (config.material) {
    const matAttr = category.attributes.find((a: { slug: string }) => a.slug === 'material' || a.slug === 'rahmen_material');
    if (matAttr) {
      const opt = matAttr.options.find((o: { value: string }) => o.value === config.material || o.value === config.rahmen_material);
      if (opt) parts.push(opt.label);
    }
  }
  if (widthMm && heightMm) parts.push(`${widthMm}x${heightMm}mm`);

  return {
    unitPrice: totalPrice,
    breakdown,
    productName: parts.join(' '),
  };
}

// Visualizer: Öffentliche Produktdaten für die Website
export async function getVisualizerCategories() {
  const catResult = await db.query(
    `SELECT id, slug, name, description FROM product_categories
     WHERE is_active = true AND show_in_visualizer = true
     ORDER BY sort_order`
  );

  const categories = [];

  for (const cat of catResult.rows) {
    const attrsResult = await db.query(
      `SELECT id, slug, label, attribute_type, unit FROM product_attributes
       WHERE category_id = $1 AND show_in_visualizer = true
         AND attribute_type IN ('select', 'boolean')
       ORDER BY sort_order`,
      [cat.id]
    );

    const attrIds = attrsResult.rows.map((a: { id: string }) => a.id);
    let options: { attribute_id: string }[] = [];
    if (attrIds.length > 0) {
      const optResult = await db.query(
        `SELECT id, attribute_id, value, label, is_default FROM product_attribute_options
         WHERE attribute_id = ANY($1) ORDER BY sort_order`,
        [attrIds]
      );
      options = optResult.rows;
    }

    const attributes = attrsResult.rows.map((attr: { id: string }) => ({
      ...attr,
      options: options.filter((o) => o.attribute_id === attr.id),
    }));

    categories.push({ ...cat, attributes });
  }

  return categories;
}

// Admin functions
export async function createCategory(data: { slug: string; name: string; description?: string; sort_order?: number }) {
  const result = await db.query(
    'INSERT INTO product_categories (slug, name, description, sort_order) VALUES ($1, $2, $3, $4) RETURNING *',
    [data.slug, data.name, data.description || null, data.sort_order || 0]
  );
  return result.rows[0];
}

export async function updateCategory(id: string, data: Record<string, unknown>) {
  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) { fields.push(`${key} = $${idx}`); params.push(value); idx++; }
  }
  if (fields.length === 0) return null;
  fields.push('updated_at = NOW()');
  params.push(id);
  const result = await db.query(`UPDATE product_categories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
  return result.rows[0] || null;
}

export async function createAttribute(data: { category_id: string; slug: string; label: string; attribute_type: string; unit?: string; is_required?: boolean; sort_order?: number }) {
  const result = await db.query(
    'INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [data.category_id, data.slug, data.label, data.attribute_type, data.unit || null, data.is_required || false, data.sort_order || 0]
  );
  return result.rows[0];
}

export async function createAttributeOption(data: { attribute_id: string; value: string; label: string; price_modifier?: number; is_default?: boolean; sort_order?: number }) {
  const result = await db.query(
    'INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [data.attribute_id, data.value, data.label, data.price_modifier || 0, data.is_default || false, data.sort_order || 0]
  );
  return result.rows[0];
}

export async function updateAttribute(id: string, data: Record<string, unknown>) {
  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) { fields.push(`${key} = $${idx}`); params.push(value); idx++; }
  }
  if (fields.length === 0) return null;
  params.push(id);
  const result = await db.query(`UPDATE product_attributes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
  return result.rows[0] || null;
}

export async function deleteAttribute(id: string) {
  const result = await db.query('DELETE FROM product_attributes WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
}

export async function updateAttributeOption(id: string, data: Record<string, unknown>) {
  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) { fields.push(`${key} = $${idx}`); params.push(value); idx++; }
  }
  if (fields.length === 0) return null;
  params.push(id);
  const result = await db.query(`UPDATE product_attribute_options SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
  return result.rows[0] || null;
}

export async function deleteAttributeOption(id: string) {
  const result = await db.query('DELETE FROM product_attribute_options WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
}

export async function getPricingRules(categoryId: string) {
  const result = await db.query('SELECT * FROM pricing_rules WHERE category_id = $1 ORDER BY rule_type, created_at', [categoryId]);
  return result.rows;
}

export async function createPricingRule(data: Record<string, unknown>) {
  const result = await db.query(
    `INSERT INTO pricing_rules (category_id, rule_type, attribute_slug, option_value, min_width, max_width, min_height, max_height, price)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [data.category_id, data.rule_type, data.attribute_slug || null, data.option_value || null,
     data.min_width || null, data.max_width || null, data.min_height || null, data.max_height || null, data.price]
  );
  return result.rows[0];
}

export async function updatePricingRule(id: string, data: Record<string, unknown>) {
  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) { fields.push(`${key} = $${idx}`); params.push(value); idx++; }
  }
  if (fields.length === 0) return null;
  fields.push('updated_at = NOW()');
  params.push(id);
  const result = await db.query(`UPDATE pricing_rules SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
  return result.rows[0] || null;
}

export async function deletePricingRule(id: string) {
  const result = await db.query('DELETE FROM pricing_rules WHERE id = $1', [id]);
  return (result.rowCount || 0) > 0;
}
