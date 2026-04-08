import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as projectsService from '../services/projects.service.js';
import * as projectDocumentsService from '../services/project-documents.service.js';

// Projects
export async function getAll(req: AuthRequest, res: Response) {
  try {
    const result = await projectsService.getAll({
      search: req.query.search as string,
      status: req.query.status as string,
      category: req.query.category as string,
      customer_id: req.query.customer_id as string,
      page: parseInt(req.query.page as string) || 1,
      per_page: parseInt(req.query.per_page as string) || 50,
    });
    res.json(result);
  } catch { res.status(500).json({ error: 'Fehler beim Laden der Projekte' }); }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    if (!req.body.customer_id || !req.body.category || !req.body.title) {
      res.status(400).json({ error: 'Kunde, Kategorie und Titel erforderlich' }); return;
    }
    const project = await projectsService.create(req.body, req.user!.id);
    res.status(201).json(project);
  } catch { res.status(500).json({ error: 'Fehler beim Erstellen des Projekts' }); }
}

export async function getById(req: AuthRequest, res: Response) {
  try {
    const project = await projectsService.getById(req.params.id);
    if (!project) { res.status(404).json({ error: 'Projekt nicht gefunden' }); return; }
    res.json(project);
  } catch { res.status(500).json({ error: 'Fehler beim Laden des Projekts' }); }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const project = await projectsService.update(req.params.id, req.body);
    if (!project) { res.status(404).json({ error: 'Projekt nicht gefunden' }); return; }
    res.json(project);
  } catch { res.status(500).json({ error: 'Fehler beim Aktualisieren des Projekts' }); }
}

export async function updateStatus(req: AuthRequest, res: Response) {
  try {
    const project = await projectsService.updateStatus(req.params.id, req.body.status);
    if (!project) { res.status(404).json({ error: 'Projekt nicht gefunden' }); return; }
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

// Measurements
export async function addMeasurement(req: AuthRequest, res: Response) {
  try {
    const m = await projectsService.addMeasurement(req.params.id, req.body);
    res.status(201).json(m);
  } catch { res.status(500).json({ error: 'Fehler beim Hinzufuegen der Messung' }); }
}

export async function updateMeasurement(req: AuthRequest, res: Response) {
  try {
    const m = await projectsService.updateMeasurement(req.params.id, req.params.mid, req.body);
    if (!m) { res.status(404).json({ error: 'Messung nicht gefunden' }); return; }
    res.json(m);
  } catch { res.status(500).json({ error: 'Fehler beim Aktualisieren der Messung' }); }
}

export async function removeMeasurement(req: AuthRequest, res: Response) {
  try {
    const deleted = await projectsService.removeMeasurement(req.params.id, req.params.mid);
    if (!deleted) { res.status(404).json({ error: 'Messung nicht gefunden' }); return; }
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Fehler beim Entfernen der Messung' }); }
}

// Documents
export async function getDocuments(req: AuthRequest, res: Response) {
  try {
    const docs = await projectDocumentsService.getByProject(req.params.id);
    res.json(docs);
  } catch { res.status(500).json({ error: 'Fehler beim Laden der Dokumente' }); }
}

export async function uploadDocument(req: AuthRequest, res: Response) {
  try {
    if (!req.file) { res.status(400).json({ error: 'Keine Datei hochgeladen' }); return; }
    const documentType = req.body.document_type || 'sonstiges';
    const doc = await projectDocumentsService.upload(req.params.id, req.file, documentType, req.user!.id);
    res.status(201).json(doc);
  } catch { res.status(500).json({ error: 'Fehler beim Hochladen des Dokuments' }); }
}

export async function downloadDocument(req: AuthRequest, res: Response) {
  try {
    const fileInfo = await projectDocumentsService.getFilePath(req.params.did);
    if (!fileInfo) { res.status(404).json({ error: 'Dokument nicht gefunden' }); return; }
    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${fileInfo.originalName}"`);
    res.sendFile(fileInfo.fullPath);
  } catch { res.status(500).json({ error: 'Fehler beim Herunterladen' }); }
}

export async function removeDocument(req: AuthRequest, res: Response) {
  try {
    const deleted = await projectDocumentsService.remove(req.params.did, req.params.id);
    if (!deleted) { res.status(404).json({ error: 'Dokument nicht gefunden' }); return; }
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Fehler beim Entfernen des Dokuments' }); }
}
