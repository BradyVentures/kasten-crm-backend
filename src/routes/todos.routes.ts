import { Router } from 'express';
import * as todosController from '../controllers/todos.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', todosController.getAll);
router.post('/', todosController.create);
router.put('/:id', todosController.update);
router.delete('/:id', todosController.remove);

export default router;
