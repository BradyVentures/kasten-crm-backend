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

export async function getCommissions(req: AuthRequest, res: Response) {
  try {
    const employee_id = req.user?.role === 'admin'
      ? (req.query.employee_id as string) || undefined
      : req.user?.id;

    const commissions = await dashboardService.getCommissions({
      employee_id,
      date_from: req.query.date_from as string,
      date_to: req.query.date_to as string,
    });
    res.json(commissions);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Provisionen' });
  }
}

export async function getRecentActivity(_req: AuthRequest, res: Response) {
  try {
    const activities = await dashboardService.getRecentActivity();
    res.json(activities);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Aktivitäten' });
  }
}
