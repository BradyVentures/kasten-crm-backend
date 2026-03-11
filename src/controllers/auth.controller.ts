import { Request, Response } from 'express';
import { loginSchema } from '../validators/auth.schema.js';
import * as authService from '../services/auth.service.js';
import { AuthRequest } from '../types/index.js';

export async function login(req: Request, res: Response) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const result = await authService.login(parsed.data.email, parsed.data.password);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login fehlgeschlagen';
    res.status(401).json({ error: message });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const user = await authService.getMe(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'Benutzer nicht gefunden' });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden des Benutzers' });
  }
}
