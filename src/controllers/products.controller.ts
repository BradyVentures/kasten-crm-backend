import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as productsService from '../services/products.service.js';

export async function getCategories(_req: AuthRequest, res: Response) {
  try {
    const categories = await productsService.getCategories();
    res.json(categories);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Kategorien' });
  }
}

export async function getCategoryBySlug(req: AuthRequest, res: Response) {
  try {
    const category = await productsService.getCategoryBySlug(req.params.slug);
    if (!category) { res.status(404).json({ error: 'Kategorie nicht gefunden' }); return; }
    res.json(category);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Kategorie' });
  }
}

export async function calculatePrice(req: AuthRequest, res: Response) {
  try {
    const config = req.query as Record<string, string>;
    const boolFields = ['entwasserung', 'beleuchtung'];
    const parsed: Record<string, string | number | boolean> = {};
    for (const [k, v] of Object.entries(config)) {
      if (boolFields.includes(k)) parsed[k] = v === 'true';
      else if (!isNaN(Number(v)) && ['breite', 'hoehe', 'tiefe'].includes(k)) parsed[k] = Number(v);
      else parsed[k] = v;
    }
    const result = await productsService.calculatePrice(req.params.slug, parsed);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function createCategory(req: AuthRequest, res: Response) {
  try {
    const category = await productsService.createCategory(req.body);
    res.status(201).json(category);
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen der Kategorie' });
  }
}

export async function updateCategory(req: AuthRequest, res: Response) {
  try {
    const category = await productsService.updateCategory(req.params.id, req.body);
    if (!category) { res.status(404).json({ error: 'Kategorie nicht gefunden' }); return; }
    res.json(category);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Kategorie' });
  }
}

export async function deleteCategory(req: AuthRequest, res: Response) {
  try {
    await productsService.deleteCategory(req.params.id);
    res.json({ message: 'Kategorie gelöscht' });
  } catch {
    res.status(500).json({ error: 'Fehler beim Löschen der Kategorie' });
  }
}

export async function createAttribute(req: AuthRequest, res: Response) {
  try {
    const attr = await productsService.createAttribute(req.body);
    res.status(201).json(attr);
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen des Attributs' });
  }
}

export async function createAttributeOption(req: AuthRequest, res: Response) {
  try {
    const option = await productsService.createAttributeOption(req.body);
    res.status(201).json(option);
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen der Option' });
  }
}

export async function updateAttribute(req: AuthRequest, res: Response) {
  try {
    const attr = await productsService.updateAttribute(req.params.id, req.body);
    if (!attr) { res.status(404).json({ error: 'Attribut nicht gefunden' }); return; }
    res.json(attr);
  } catch { res.status(500).json({ error: 'Fehler beim Aktualisieren' }); }
}

export async function deleteAttribute(req: AuthRequest, res: Response) {
  try {
    const ok = await productsService.deleteAttribute(req.params.id);
    if (!ok) { res.status(404).json({ error: 'Attribut nicht gefunden' }); return; }
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Fehler beim Loeschen' }); }
}

export async function updateAttributeOption(req: AuthRequest, res: Response) {
  try {
    const opt = await productsService.updateAttributeOption(req.params.id, req.body);
    if (!opt) { res.status(404).json({ error: 'Option nicht gefunden' }); return; }
    res.json(opt);
  } catch { res.status(500).json({ error: 'Fehler beim Aktualisieren' }); }
}

export async function deleteAttributeOption(req: AuthRequest, res: Response) {
  try {
    const ok = await productsService.deleteAttributeOption(req.params.id);
    if (!ok) { res.status(404).json({ error: 'Option nicht gefunden' }); return; }
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Fehler beim Loeschen' }); }
}

export async function getPricingRules(req: AuthRequest, res: Response) {
  try {
    const rules = await productsService.getPricingRules(req.params.categoryId);
    res.json(rules);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Preisregeln' });
  }
}

export async function createPricingRule(req: AuthRequest, res: Response) {
  try {
    const rule = await productsService.createPricingRule(req.body);
    res.status(201).json(rule);
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen der Preisregel' });
  }
}

export async function updatePricingRule(req: AuthRequest, res: Response) {
  try {
    const rule = await productsService.updatePricingRule(req.params.id, req.body);
    if (!rule) { res.status(404).json({ error: 'Preisregel nicht gefunden' }); return; }
    res.json(rule);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Preisregel' });
  }
}

export async function deletePricingRule(req: AuthRequest, res: Response) {
  try {
    const deleted = await productsService.deletePricingRule(req.params.id);
    if (!deleted) { res.status(404).json({ error: 'Preisregel nicht gefunden' }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Fehler beim Loeschen der Preisregel' });
  }
}
