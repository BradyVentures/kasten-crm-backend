import { Router } from 'express';
import * as promotionsController from '../controllers/promotions.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', promotionsController.getAll);
router.get('/for-service/:serviceId', promotionsController.getForService);
router.get('/:id', promotionsController.getById);
router.post('/', adminOnly, promotionsController.create);
router.put('/:id', adminOnly, promotionsController.update);
router.delete('/:id', adminOnly, promotionsController.remove);

export default router;
