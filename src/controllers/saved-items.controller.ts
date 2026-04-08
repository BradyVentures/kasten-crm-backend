import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as savedItemsService from '../services/saved-items.service.js';

export async function getAll(req: AuthRequest, res: Response) {
  try {
    const items = await savedItemsService.getAll(req.query.category as string);
    res.json(items);
  } catch { res.status(500).json({ error: 'Fehler beim Laden der Textbausteine' }); }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const item = await savedItemsService.create(req.body, req.user!.id);
    res.status(201).json(item);
  } catch { res.status(500).json({ error: 'Fehler beim Erstellen des Textbausteins' }); }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const item = await savedItemsService.update(req.params.id, req.body);
    if (!item) { res.status(404).json({ error: 'Textbaustein nicht gefunden' }); return; }
    res.json(item);
  } catch { res.status(500).json({ error: 'Fehler beim Aktualisieren des Textbausteins' }); }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const deleted = await savedItemsService.remove(req.params.id);
    if (!deleted) { res.status(404).json({ error: 'Textbaustein nicht gefunden' }); return; }
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Fehler beim Loeschen des Textbausteins' }); }
}
