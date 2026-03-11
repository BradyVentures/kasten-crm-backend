import { Router } from 'express';
import * as servicesController from '../controllers/services.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', servicesController.getAll);
router.post('/', adminOnly, servicesController.create);
router.put('/:id', adminOnly, servicesController.update);
router.delete('/:id', adminOnly, servicesController.remove);

export default router;
