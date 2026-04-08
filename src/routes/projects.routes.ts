import { Router } from 'express';
import multer from 'multer';
import * as projectsController from '../controllers/projects.controller.js';
import { authenticate } from '../middleware/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const router = Router();
router.use(authenticate);

// Projects CRUD
router.get('/', projectsController.getAll);
router.post('/', projectsController.create);
router.get('/:id', projectsController.getById);
router.put('/:id', projectsController.update);
router.patch('/:id/status', projectsController.updateStatus);

// Measurements
router.post('/:id/measurements', projectsController.addMeasurement);
router.put('/:id/measurements/:mid', projectsController.updateMeasurement);
router.delete('/:id/measurements/:mid', projectsController.removeMeasurement);

// Documents
router.get('/:id/documents', projectsController.getDocuments);
router.post('/:id/documents', upload.single('file'), projectsController.uploadDocument);
router.get('/:id/documents/:did/download', projectsController.downloadDocument);
router.delete('/:id/documents/:did', projectsController.removeDocument);

export default router;
