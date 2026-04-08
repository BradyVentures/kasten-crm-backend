import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as dashboardService from '../services/dashboard.service.js';

export async function getStats(_req: AuthRequest, res: Response) {
  try {
    const stats = await dashboardService.getStats();
    res.json(stats);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
  }
}

export async function getRecentOffers(_req: AuthRequest, res: Response) {
  try {
    const offers = await dashboardService.getRecentOffers();
    res.json(offers);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der letzten Angebote' });
  }
}
