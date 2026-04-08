import { Router } from 'express';
import multer from 'multer';
import * as importController from '../controllers/import.controller.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Nur .docx Dateien erlaubt'));
    }
  },
});

const router = Router();

router.use(authenticate);
router.use(adminOnly);

router.post('/customers/preview', upload.single('file'), importController.preview);
router.post('/customers/execute', importController.execute);

export default router;
