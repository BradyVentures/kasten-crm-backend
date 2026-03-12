import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { REGIONS } from '../config/regions.js';

export async function getAll(req: AuthRequest, res: Response) {
  res.json(REGIONS);
}
