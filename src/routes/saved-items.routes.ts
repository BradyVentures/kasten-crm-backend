import { Router } from 'express';
import * as savedItemsController from '../controllers/saved-items.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

router.get('/', savedItemsController.getAll);
router.post('/', savedItemsController.create);
router.put('/:id', savedItemsController.update);
router.delete('/:id', savedItemsController.remove);

export default router;
