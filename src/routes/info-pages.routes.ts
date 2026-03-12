import { Router } from 'express';
import * as infoPagesController from '../controllers/info-pages.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', infoPagesController.getAll);
router.get('/:slug', infoPagesController.getBySlug);
router.put('/:slug', infoPagesController.update);

export default router;
