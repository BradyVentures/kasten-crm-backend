import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/commissions', dashboardController.getCommissions);
router.get('/recent-activity', dashboardController.getRecentActivity);

export default router;
