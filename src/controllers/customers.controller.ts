import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as customersService from '../services/customers.service.js';
import { updateCustomerSchema, assignServiceSchema } from '../validators/customers.schema.js';

export async function getAll(req: AuthRequest, res: Response) {
  try {
    const result = await customersService.getAll({
      search: req.query.search as string,
      page: parseInt(req.query.page as string) || 1,
      per_page: parseInt(req.query.per_page as string) || 50,
    });
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Kunden' });
  }
}

export async function getById(req: AuthRequest, res: Response) {
  try {
    const customer = await customersService.getById(req.params.id);
    if (!customer) { res.status(404).json({ error: 'Kunde nicht gefunden' }); return; }
    res.json(customer);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden des Kunden' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const parsed = updateCustomerSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const customer = await customersService.update(req.params.id, parsed.data);
    if (!customer) { res.status(404).json({ error: 'Kunde nicht gefunden' }); return; }
    res.json(customer);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Kunden' });
  }
}

export async function assignService(req: AuthRequest, res: Response) {
  try {
    const parsed = assignServiceSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const result = await customersService.assignService(req.params.id, parsed.data, req.user!.id);
    res.status(201).json(result);
  } catch {
    res.status(500).json({ error: 'Fehler beim Zuweisen des Service' });
  }
}

export async function removeService(req: AuthRequest, res: Response) {
  try {
    const result = await customersService.removeService(req.params.id, req.params.csId);
    if (!result) { res.status(404).json({ error: 'Service-Zuweisung nicht gefunden' }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Fehler beim Entfernen des Service' });
  }
}
