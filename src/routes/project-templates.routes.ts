import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as templatesService from '../services/projectTemplates.service.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const templates = await templatesService.getAll();
    res.json(templates);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Templates' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, default_modules } = req.body;
    if (!name) { res.status(400).json({ error: 'Name erforderlich' }); return; }
    const template = await templatesService.create({ name, description, default_modules }, req.user!.id);
    res.status(201).json(template);
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen des Templates' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const template = await templatesService.update(req.params.id, req.body);
    if (!template) { res.status(404).json({ error: 'Template nicht gefunden' }); return; }
    res.json(template);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Templates' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await templatesService.remove(req.params.id);
    if (!deleted) { res.status(404).json({ error: 'Template nicht gefunden' }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Fehler beim Löschen des Templates' });
  }
});

export default router;
