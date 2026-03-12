import { Router } from 'express';
import * as regionsController from '../controllers/regions.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', regionsController.getAll);

export default router;
