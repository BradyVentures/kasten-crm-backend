import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import * as emailTemplatesController from '../controllers/email-templates.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', emailTemplatesController.getAll);
router.get('/categories', emailTemplatesController.getCategories);
router.post('/', emailTemplatesController.create);
router.put('/:id', emailTemplatesController.update);
router.delete('/:id', emailTemplatesController.remove);

export default router;
