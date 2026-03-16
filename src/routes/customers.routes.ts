import { Router } from 'express';
import * as customersController from '../controllers/customers.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', customersController.create);
router.get('/', customersController.getAll);
router.get('/:id', customersController.getById);
router.put('/:id', customersController.update);
router.delete('/:id', customersController.deleteCustomer);
router.post('/:id/services', customersController.assignService);
router.delete('/:id/services/:csId', customersController.removeService);

export default router;
