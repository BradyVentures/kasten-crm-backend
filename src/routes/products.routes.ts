import { Router } from 'express';
import * as productsController from '../controllers/products.controller.js';
import * as productsService from '../services/products.service.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

// Öffentlicher Endpoint (kein Auth) — für Website-Visualizer
router.get('/visualizer/categories', async (_req, res) => {
  try {
    const categories = await productsService.getVisualizerCategories();
    res.json(categories);
  } catch (error) {
    console.error('Visualizer categories error:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

router.use(authenticate);

router.get('/categories', productsController.getCategories);
router.get('/categories/:slug', productsController.getCategoryBySlug);
router.get('/categories/:slug/calculate', productsController.calculatePrice);

// Admin routes
router.post('/categories', adminOnly, productsController.createCategory);
router.put('/categories/:id', adminOnly, productsController.updateCategory);
router.delete('/categories/:id', adminOnly, productsController.deleteCategory);
router.post('/attributes', adminOnly, productsController.createAttribute);
router.put('/attributes/:id', adminOnly, productsController.updateAttribute);
router.delete('/attributes/:id', adminOnly, productsController.deleteAttribute);
router.post('/attribute-options', adminOnly, productsController.createAttributeOption);
router.put('/attribute-options/:id', adminOnly, productsController.updateAttributeOption);
router.delete('/attribute-options/:id', adminOnly, productsController.deleteAttributeOption);
router.get('/pricing-rules/:categoryId', adminOnly, productsController.getPricingRules);
router.post('/pricing-rules', adminOnly, productsController.createPricingRule);
router.put('/pricing-rules/:id', adminOnly, productsController.updatePricingRule);
router.delete('/pricing-rules/:id', adminOnly, productsController.deletePricingRule);

export default router;
