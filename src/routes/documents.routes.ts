import { Router } from 'express';
import * as documentsController from '../controllers/documents.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', documentsController.getAll);
router.post('/', adminOnly, documentsController.uploadMiddleware, documentsController.create);
router.get('/:id/download', documentsController.download);
router.get('/:id/preview', documentsController.preview);
router.delete('/:id', adminOnly, documentsController.remove);

export default router;
