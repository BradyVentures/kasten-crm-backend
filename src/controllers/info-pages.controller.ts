import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as infoPagesService from '../services/info-pages.service.js';
import { updateInfoPageSchema } from '../validators/info-pages.schema.js';

export async function getAll(req: AuthRequest, res: Response) {
  try {
    const pages = await infoPagesService.getAll();
    res.json(pages);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Info-Seiten' });
  }
}

export async function getBySlug(req: AuthRequest, res: Response) {
  try {
    const page = await infoPagesService.getBySlug(req.params.slug);
    if (!page) { res.status(404).json({ error: 'Seite nicht gefunden' }); return; }
    res.json(page);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Info-Seite' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const parsed = updateInfoPageSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const page = await infoPagesService.update(req.params.slug, parsed.data.content, req.user!.id);
    if (!page) { res.status(404).json({ error: 'Seite nicht gefunden' }); return; }
    res.json(page);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Info-Seite' });
  }
}
