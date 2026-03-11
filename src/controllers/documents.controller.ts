import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { AuthRequest } from '../types/index.js';
import * as documentsService from '../services/documents.service.js';
import { createDocumentSchema } from '../validators/documents.schema.js';

const upload = multer({
  dest: 'uploads/documents/',
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/png',
      'image/jpeg',
      'image/gif',
      'text/plain',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Dateityp nicht erlaubt'));
    }
  },
});

export const uploadMiddleware = upload.single('file');

export async function getAll(req: AuthRequest, res: Response) {
  try {
    const category = req.query.category as string | undefined;
    const documents = await documentsService.getAll(category);
    res.json(documents);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Dokumente' });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Keine Datei hochgeladen' });
      return;
    }

    const parsed = createDocumentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const document = await documentsService.create({
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category || 'Sonstiges',
      file_path: req.file.path,
      original_name: req.file.originalname,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_by: req.user!.id,
    });
    res.status(201).json(document);
  } catch {
    res.status(500).json({ error: 'Fehler beim Hochladen des Dokuments' });
  }
}

export async function download(req: AuthRequest, res: Response) {
  try {
    const document = await documentsService.getById(req.params.id);
    if (!document) {
      res.status(404).json({ error: 'Dokument nicht gefunden' });
      return;
    }

    const filePath = path.resolve(document.file_path);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Datei nicht gefunden' });
      return;
    }

    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.original_name)}"`);
    res.setHeader('Content-Length', document.file_size.toString());
    fs.createReadStream(filePath).pipe(res);
  } catch {
    res.status(500).json({ error: 'Fehler beim Download' });
  }
}

export async function preview(req: AuthRequest, res: Response) {
  try {
    const document = await documentsService.getById(req.params.id);
    if (!document) {
      res.status(404).json({ error: 'Dokument nicht gefunden' });
      return;
    }

    const filePath = path.resolve(document.file_path);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: 'Datei nicht gefunden' });
      return;
    }

    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(document.original_name)}"`);
    res.setHeader('Content-Length', document.file_size.toString());
    fs.createReadStream(filePath).pipe(res);
  } catch {
    res.status(500).json({ error: 'Fehler beim Anzeigen' });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const document = await documentsService.remove(req.params.id);
    if (!document) {
      res.status(404).json({ error: 'Dokument nicht gefunden' });
      return;
    }

    try {
      fs.unlinkSync(path.resolve(document.file_path));
    } catch {
      // File already deleted, ignore
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Fehler beim Löschen des Dokuments' });
  }
}
