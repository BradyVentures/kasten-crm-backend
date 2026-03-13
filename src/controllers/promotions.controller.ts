import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as promotionsService from '../services/promotions.service.js';
import { createPromotionSchema, updatePromotionSchema } from '../validators/promotions.schema.js';

export async function getAll(req: AuthRequest, res: Response) {
  try {
    const includeInactive = req.user?.role === 'admin';
    const promotions = await promotionsService.getAll(includeInactive);
    res.json(promotions);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Aktionen' });
  }
}

export async function getById(req: AuthRequest, res: Response) {
  try {
    const promotion = await promotionsService.getById(req.params.id);
    if (!promotion) { res.status(404).json({ error: 'Aktion nicht gefunden' }); return; }
    res.json(promotion);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Aktion' });
  }
}

export async function getForService(req: AuthRequest, res: Response) {
  try {
    const promotions = await promotionsService.getActiveForService(req.params.serviceId);
    res.json(promotions);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Aktionen' });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const parsed = createPromotionSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const promotion = await promotionsService.create(parsed.data, req.user!.id);
    res.status(201).json(promotion);
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen der Aktion' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const parsed = updatePromotionSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const promotion = await promotionsService.update(req.params.id, parsed.data);
    if (!promotion) { res.status(404).json({ error: 'Aktion nicht gefunden' }); return; }
    res.json(promotion);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Aktion' });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const promotion = await promotionsService.softDelete(req.params.id);
    if (!promotion) { res.status(404).json({ error: 'Aktion nicht gefunden' }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Fehler beim Deaktivieren der Aktion' });
  }
}
