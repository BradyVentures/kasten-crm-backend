import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', usersController.getAll);
router.post('/', adminOnly, usersController.create);
router.put('/:id', adminOnly, usersController.update);
router.patch('/:id/password', adminOnly, usersController.resetPassword);

export default router;
