import { Router, Request, Response } from 'express';
import * as offersController from '../controllers/offers.controller.js';
import * as offersService from '../services/offers.service.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Öffentlicher Endpoint (kein Auth) — für Website-Visualizer Angebotserstellung
router.post('/from-visualizer', async (req: Request, res: Response) => {
  try {
    const { customer_name, customer_email, customer_phone, category_slug,
            product_name, configuration, unit_price,
            visualizer_image_url, visualizer_request_id, notes } = req.body;

    if (!customer_name || !customer_email || !category_slug) {
      res.status(400).json({ error: 'customer_name, customer_email und category_slug sind erforderlich' });
      return;
    }

    const offer = await offersService.createFromVisualizer({
      customer_name, customer_email, customer_phone, category_slug,
      product_name: product_name || category_slug,
      configuration: configuration || {},
      unit_price, visualizer_image_url, visualizer_request_id, notes,
    });

    res.status(201).json(offer);
  } catch (error) {
    console.error('Visualizer offer creation error:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Angebots' });
  }
});

router.use(authenticate);

router.get('/', offersController.getAll);
router.post('/', offersController.create);
router.get('/:id', offersController.getById);
router.put('/:id', offersController.update);
router.delete('/:id', offersController.deleteOffer);
router.patch('/:id/status', offersController.updateStatus);
router.post('/:id/items', offersController.addItem);
router.put('/:id/items/:itemId', offersController.updateItem);
router.delete('/:id/items/:itemId', offersController.removeItem);
router.post('/:id/duplicate', offersController.duplicateOffer);
router.get('/:id/pdf', offersController.generatePdf);

export default router;
