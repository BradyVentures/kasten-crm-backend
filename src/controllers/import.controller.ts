import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as importService from '../services/import.service.js';

export async function preview(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Keine Datei hochgeladen' }); return;
    }
    const rows = await importService.parseDocx(req.file.buffer);
    res.json({ rows, total: rows.length });
  } catch (err) {
    res.status(500).json({ error: 'Fehler beim Parsen der Datei: ' + (err as Error).message });
  }
}

export async function execute(req: AuthRequest, res: Response) {
  try {
    const { rows } = req.body;
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      res.status(400).json({ error: 'Keine Daten zum Importieren' }); return;
    }
    const result = await importService.executeImport(rows, req.user!.id);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Fehler beim Importieren der Kunden' });
  }
}
