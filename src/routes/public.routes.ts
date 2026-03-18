import { Router, Request, Response } from 'express';
import { db } from '../config/database.js';

const router = Router();

// Allow cross-origin from brady-digital.com
router.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=60');
  next();
});

// Public endpoint: Promotion progress (no auth required)
// Returns taken/total slots for the active "lets go" promotion
router.get('/promotion-progress', async (_req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT name, current_redemptions, max_redemptions
       FROM promotions
       WHERE is_active = true
         AND name ILIKE '%lets go%'
       LIMIT 1`
    );

    if (result.rows.length === 0) {
      res.json({ taken: 0, total: 10, name: 'Lets Go' });
      return;
    }

    const promo = result.rows[0];
    res.json({
      taken: promo.current_redemptions || 0,
      total: promo.max_redemptions || 10,
      name: promo.name,
    });
  } catch {
    res.json({ taken: 0, total: 10, name: 'Lets Go' });
  }
});

export default router;
