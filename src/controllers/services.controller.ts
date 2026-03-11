import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as servicesService from '../services/services.service.js';
import { createServiceSchema, updateServiceSchema } from '../validators/services.schema.js';

export async function getAll(req: AuthRequest, res: Response) {
  try {
    const includeInactive = req.user?.role === 'admin';
    const services = await servicesService.getAll(includeInactive);
    res.json(services);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Services' });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const parsed = createServiceSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const service = await servicesService.create(parsed.data);
    res.status(201).json(service);
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen des Service' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const parsed = updateServiceSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const service = await servicesService.update(req.params.id, parsed.data);
    if (!service) { res.status(404).json({ error: 'Service nicht gefunden' }); return; }
    res.json(service);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Service' });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const service = await servicesService.softDelete(req.params.id);
    if (!service) { res.status(404).json({ error: 'Service nicht gefunden' }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Fehler beim Löschen des Service' });
  }
}
