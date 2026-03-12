import { Router } from 'express';
import authRoutes from './auth.routes.js';
import leadsRoutes from './leads.routes.js';
import customersRoutes from './customers.routes.js';
import servicesRoutes from './services.routes.js';
import usersRoutes from './users.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import documentsRoutes from './documents.routes.js';
import infoPagesRoutes from './info-pages.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/leads', leadsRoutes);
router.use('/customers', customersRoutes);
router.use('/services', servicesRoutes);
router.use('/users', usersRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/documents', documentsRoutes);
router.use('/info-pages', infoPagesRoutes);

export default router;
