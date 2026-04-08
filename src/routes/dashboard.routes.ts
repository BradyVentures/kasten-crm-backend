import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/recent-offers', dashboardController.getRecentOffers);

export default router;
