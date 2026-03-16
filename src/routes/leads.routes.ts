import { Router } from 'express';
import * as leadsController from '../controllers/leads.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', leadsController.getAll);
router.get('/distinct-values', leadsController.getDistinctValues);
router.get('/region-counts', leadsController.getRegionCounts);
router.get('/locks', leadsController.getAllLocks);
router.delete('/bulk', leadsController.bulkDelete);
router.delete('/:id', leadsController.deleteLead);
router.get('/:id', leadsController.getById);
router.post('/', leadsController.create);
router.put('/:id', leadsController.update);
router.patch('/:id/status', leadsController.updateStatus);
router.patch('/:id/assign', leadsController.assign);
router.post('/:id/convert', leadsController.convertToCustomer);
router.get('/:id/activities', leadsController.getActivities);
router.post('/:id/activities', leadsController.addActivity);
router.delete('/:id/activities/:activityId', leadsController.deleteActivity);
router.post('/import', leadsController.uploadMiddleware, leadsController.importExcel);
router.post('/import/confirm', leadsController.confirmImport);
router.post('/:id/lock', leadsController.acquireLock);
router.delete('/:id/lock', leadsController.releaseLock);

export default router;
