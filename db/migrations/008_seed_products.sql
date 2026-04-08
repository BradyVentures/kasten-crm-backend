-- Kategorien
INSERT INTO product_categories (slug, name, description, sort_order) VALUES
    ('rolllaeden', 'Rolllaeden', 'Rolllaeden in verschiedenen Materialien und Groessen', 1),
    ('terrassendaecher', 'Terrassendaecher', 'Terrassenueberdachungen aus Aluminium oder Holz', 2),
    ('fenster', 'Fenster', 'Fenster in verschiedenen Materialien und Verglasungen', 3);

-- ==========================================
-- ROLLLAEDEN Attribute
-- ==========================================
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'breite', 'Breite', 'number', 'mm', true, 1 FROM product_categories WHERE slug = 'rolllaeden';
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'hoehe', 'Hoehe', 'number', 'mm', true, 2 FROM product_categories WHERE slug = 'rolllaeden';
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'material', 'Material', 'select', NULL, true, 3 FROM product_categories WHERE slug = 'rolllaeden';
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'farbe', 'Farbe', 'select', NULL, true, 4 FROM product_categories WHERE slug = 'rolllaeden';
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'antrieb', 'Antriebsart', 'select', NULL, true, 5 FROM product_categories WHERE slug = 'rolllaeden';
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'kasten_typ', 'Kastentyp', 'select', NULL, false, 6 FROM product_categories WHERE slug = 'rolllaeden';

-- Rolllaeden Material Optionen
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'kunststoff', 'Kunststoff', 0, true, 1
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'rolllaeden' AND pa.slug = 'material';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'aluminium', 'Aluminium', 45.00, false, 2
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'rolllaeden' AND pa.slug = 'material';

-- Rolllaeden Farbe Optionen
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'weiss', 'Weiss', 0, true, 1
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'rolllaeden' AND pa.slug = 'farbe';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'grau', 'Grau (RAL 7016)', 25.00, false, 2
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'rolllaeden' AND pa.slug = 'farbe';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'braun', 'Braun', 25.00, false, 3
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'rolllaeden' AND pa.slug = 'farbe';

-- Rolllaeden Antrieb Optionen
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'gurt', 'Gurtwickler', 0, true, 1
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'rolllaeden' AND pa.slug = 'antrieb';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'motor', 'Elektromotor', 120.00, false, 2
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'rolllaeden' AND pa.slug = 'antrieb';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'funk', 'Funkmotor (Smart Home)', 195.00, false, 3
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'rolllaeden' AND pa.slug = 'antrieb';

-- Rolllaeden Kastentyp Optionen
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'vorbau', 'Vorbaurollladen', 0, true, 1
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'rolllaeden' AND pa.slug = 'kasten_typ';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'aufsatz', 'Aufsatzrollladen', 35.00, false, 2
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'rolllaeden' AND pa.slug = 'kasten_typ';

-- ==========================================
-- TERRASSENDAECHER Attribute
-- ==========================================
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'breite', 'Breite', 'number', 'mm', true, 1 FROM product_categories WHERE slug = 'terrassendaecher';
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'tiefe', 'Tiefe', 'number', 'mm', true, 2 FROM product_categories WHERE slug = 'terrassendaecher';
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'hoehe', 'Hoehe', 'number', 'mm', true, 3 FROM product_categories WHERE slug = 'terrassendaecher';
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'material', 'Material', 'select', NULL, true, 4 FROM product_categories WHERE slug = 'terrassendaecher';
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'verglasung', 'Verglasung', 'select', NULL, true, 5 FROM product_categories WHERE slug = 'terrassendaecher';
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'entwasserung', 'Entwaesserung integriert', 'boolean', NULL, false, 6 FROM product_categories WHERE slug = 'terrassendaecher';
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'beleuchtung', 'LED-Beleuchtung', 'boolean', NULL, false, 7 FROM product_categories WHERE slug = 'terrassendaecher';

-- Terrassendaecher Material Optionen
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'aluminium', 'Aluminium', 0, true, 1
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'terrassendaecher' AND pa.slug = 'material';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'holz', 'Holz (Leimholz)', 350.00, false, 2
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'terrassendaecher' AND pa.slug = 'material';

-- Terrassendaecher Verglasung Optionen
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'stegplatten', 'Stegplatten (16mm)', 0, true, 1
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'terrassendaecher' AND pa.slug = 'verglasung';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'vsg_klar', 'VSG Glas klar', 180.00, false, 2
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'terrassendaecher' AND pa.slug = 'verglasung';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'vsg_matt', 'VSG Glas matt', 220.00, false, 3
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'terrassendaecher' AND pa.slug = 'verglasung';

-- ==========================================
-- FENSTER Attribute
-- ==========================================
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'breite', 'Breite', 'number', 'mm', true, 1 FROM product_categories WHERE slug = 'fenster';
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'hoehe', 'Hoehe', 'number', 'mm', true, 2 FROM product_categories WHERE slug = 'fenster';
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'rahmen_material', 'Rahmenmaterial', 'select', NULL, true, 3 FROM product_categories WHERE slug = 'fenster';
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'verglasung', 'Verglasung', 'select', NULL, true, 4 FROM product_categories WHERE slug = 'fenster';
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'oeffnungsart', 'Oeffnungsart', 'select', NULL, true, 5 FROM product_categories WHERE slug = 'fenster';
INSERT INTO product_attributes (category_id, slug, label, attribute_type, unit, is_required, sort_order)
SELECT id, 'farbe', 'Farbe', 'select', NULL, true, 6 FROM product_categories WHERE slug = 'fenster';

-- Fenster Rahmenmaterial Optionen
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'kunststoff', 'Kunststoff', 0, true, 1
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'fenster' AND pa.slug = 'rahmen_material';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'holz', 'Holz', 85.00, false, 2
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'fenster' AND pa.slug = 'rahmen_material';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'alu_kunststoff', 'Aluminium-Kunststoff', 120.00, false, 3
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'fenster' AND pa.slug = 'rahmen_material';

-- Fenster Verglasung Optionen
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, '2fach', '2-fach Verglasung', 0, true, 1
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'fenster' AND pa.slug = 'verglasung';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, '3fach', '3-fach Verglasung', 65.00, false, 2
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'fenster' AND pa.slug = 'verglasung';

-- Fenster Oeffnungsart Optionen
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'dreh_kipp', 'Dreh-Kipp', 0, true, 1
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'fenster' AND pa.slug = 'oeffnungsart';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'festverglast', 'Festverglasung', -30.00, false, 2
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'fenster' AND pa.slug = 'oeffnungsart';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'kipp', 'Kippfenster', -15.00, false, 3
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'fenster' AND pa.slug = 'oeffnungsart';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'schiebeanlage', 'Schiebeanlage', 150.00, false, 4
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'fenster' AND pa.slug = 'oeffnungsart';

-- Fenster Farbe Optionen
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'weiss', 'Weiss', 0, true, 1
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'fenster' AND pa.slug = 'farbe';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'anthrazit', 'Anthrazit (RAL 7016)', 40.00, false, 2
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'fenster' AND pa.slug = 'farbe';
INSERT INTO product_attribute_options (attribute_id, value, label, price_modifier, is_default, sort_order)
SELECT pa.id, 'golden_oak', 'Golden Oak (Dekor)', 55.00, false, 3
FROM product_attributes pa JOIN product_categories pc ON pa.category_id = pc.id
WHERE pc.slug = 'fenster' AND pa.slug = 'farbe';

-- ==========================================
-- PLATZHALTER PREISREGELN
-- ==========================================

-- Rolllaeden: 85 EUR/m2 Basis
INSERT INTO pricing_rules (category_id, rule_type, price)
SELECT id, 'base_sqm', 85.00 FROM product_categories WHERE slug = 'rolllaeden';
INSERT INTO pricing_rules (category_id, rule_type, price)
SELECT id, 'min_price', 150.00 FROM product_categories WHERE slug = 'rolllaeden';

-- Terrassendaecher: 220 EUR/m2 Basis
INSERT INTO pricing_rules (category_id, rule_type, price)
SELECT id, 'base_sqm', 220.00 FROM product_categories WHERE slug = 'terrassendaecher';
INSERT INTO pricing_rules (category_id, rule_type, price)
SELECT id, 'min_price', 2500.00 FROM product_categories WHERE slug = 'terrassendaecher';

-- Fenster: 180 EUR/m2 Basis
INSERT INTO pricing_rules (category_id, rule_type, price)
SELECT id, 'base_sqm', 180.00 FROM product_categories WHERE slug = 'fenster';
INSERT INTO pricing_rules (category_id, rule_type, price)
SELECT id, 'min_price', 200.00 FROM product_categories WHERE slug = 'fenster';
