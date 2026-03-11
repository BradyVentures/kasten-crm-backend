import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as usersService from '../services/users.service.js';
import { createUserSchema, updateUserSchema, resetPasswordSchema } from '../validators/services.schema.js';

export async function getAll(_req: AuthRequest, res: Response) {
  try {
    const users = await usersService.getAll();
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Benutzer' });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const user = await usersService.create(parsed.data);
    res.status(201).json(user);
  } catch (err) {
    const message = err instanceof Error && err.message.includes('duplicate')
      ? 'E-Mail-Adresse bereits vergeben'
      : 'Fehler beim Erstellen des Benutzers';
    res.status(400).json({ error: message });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const user = await usersService.update(req.params.id, parsed.data);
    if (!user) { res.status(404).json({ error: 'Benutzer nicht gefunden' }); return; }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Benutzers' });
  }
}

export async function resetPassword(req: AuthRequest, res: Response) {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const user = await usersService.resetPassword(req.params.id, parsed.data.password);
    if (!user) { res.status(404).json({ error: 'Benutzer nicht gefunden' }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Fehler beim Zurücksetzen des Passworts' });
  }
}
