import { Router } from 'express';
import authRoutes from './auth.routes.js';
import customersRoutes from './customers.routes.js';
import usersRoutes from './users.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import todosRoutes from './todos.routes.js';
import productsRoutes from './products.routes.js';
import offersRoutes from './offers.routes.js';
import importRoutes from './import.routes.js';
import projectsRoutes from './projects.routes.js';
import savedItemsRoutes from './saved-items.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customers', customersRoutes);
router.use('/users', usersRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/todos', todosRoutes);
router.use('/products', productsRoutes);
router.use('/offers', offersRoutes);
router.use('/import', importRoutes);
router.use('/projects', projectsRoutes);
router.use('/saved-items', savedItemsRoutes);

export default router;
