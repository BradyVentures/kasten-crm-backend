import { Router } from 'express';
import * as projectsController from '../controllers/projects.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Projects
router.get('/', projectsController.getAll);
router.post('/', projectsController.create);
router.get('/:id', projectsController.getById);
router.put('/:id', projectsController.update);
router.patch('/:id/status', projectsController.updateStatus);
router.delete('/:id', projectsController.remove);
router.post('/:id/recalculate', projectsController.recalculate);
router.post('/from-template/:templateId', projectsController.createFromTemplate);

// Modules
router.get('/:id/modules', projectsController.getModules);
router.post('/:id/modules', projectsController.createModule);
router.put('/:id/modules/:moduleId', projectsController.updateModule);
router.delete('/:id/modules/:moduleId', projectsController.removeModule);
router.patch('/:id/modules/reorder', projectsController.reorderModules);

// Documents
router.get('/:id/documents', projectsController.getDocuments);
router.post('/:id/documents/generate', projectsController.generateDocument);
router.delete('/:id/documents/:docId', projectsController.removeDocument);

// Activities
router.get('/:id/activities', projectsController.getActivities);
router.post('/:id/activities', projectsController.createActivity);

export default router;
