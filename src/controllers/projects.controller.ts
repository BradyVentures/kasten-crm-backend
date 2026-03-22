import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as projectsService from '../services/projects.service.js';
import * as modulesService from '../services/projectModules.service.js';
import * as documentsService from '../services/projectDocuments.service.js';
import * as activitiesService from '../services/projectActivities.service.js';
import {
  createProjectSchema,
  updateProjectSchema,
  createModuleSchema,
  updateModuleSchema,
  createActivitySchema,
  generateDocumentSchema,
} from '../validators/projects.schema.js';

// ─── Projects ─────────────────────────────────────────────

export async function getAll(req: AuthRequest, res: Response) {
  try {
    const result = await projectsService.getAll({
      status: req.query.status as string,
      customer_id: req.query.customer_id as string,
      assigned_to: req.query.assigned_to as string,
      search: req.query.search as string,
    });
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Projekte' });
  }
}

export async function getById(req: AuthRequest, res: Response) {
  try {
    const project = await projectsService.getById(req.params.id);
    if (!project) { res.status(404).json({ error: 'Projekt nicht gefunden' }); return; }
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden des Projekts' });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const project = await projectsService.create(parsed.data, req.user!.id);
    res.status(201).json(project);
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen des Projekts' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const parsed = updateProjectSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const project = await projectsService.update(req.params.id, parsed.data, req.user!.id);
    if (!project) { res.status(404).json({ error: 'Projekt nicht gefunden' }); return; }
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Projekts' });
  }
}

export async function updateStatus(req: AuthRequest, res: Response) {
  try {
    const { status } = req.body;
    if (!status) { res.status(400).json({ error: 'Status erforderlich' }); return; }
    const project = await projectsService.updateStatus(req.params.id, status, req.user!.id);
    if (!project) { res.status(404).json({ error: 'Projekt nicht gefunden' }); return; }
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Status' });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const deleted = await projectsService.remove(req.params.id);
    if (!deleted) { res.status(404).json({ error: 'Projekt nicht gefunden' }); return; }
    res.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message.includes('entwurf')) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'Fehler beim Löschen des Projekts' });
  }
}

export async function recalculate(req: AuthRequest, res: Response) {
  try {
    const project = await projectsService.recalculate(req.params.id);
    if (!project) { res.status(404).json({ error: 'Projekt nicht gefunden' }); return; }
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Fehler bei der Neuberechnung' });
  }
}

export async function createFromTemplate(req: AuthRequest, res: Response) {
  try {
    const parsed = createProjectSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const project = await projectsService.createFromTemplate(req.params.templateId, parsed.data, req.user!.id);
    res.status(201).json(project);
  } catch (err) {
    if (err instanceof Error && err.message.includes('Template')) {
      res.status(404).json({ error: err.message });
      return;
    }
    console.error('Error creating from template:', err);
    res.status(500).json({ error: 'Fehler beim Erstellen aus Template' });
  }
}

// ─── Modules ──────────────────────────────────────────────

export async function getModules(req: AuthRequest, res: Response) {
  try {
    const modules = await modulesService.getByProject(req.params.id);
    res.json(modules);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Module' });
  }
}

export async function createModule(req: AuthRequest, res: Response) {
  try {
    const parsed = createModuleSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const module = await modulesService.create(req.params.id, parsed.data);
    res.status(201).json(module);
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen des Moduls' });
  }
}

export async function updateModule(req: AuthRequest, res: Response) {
  try {
    const parsed = updateModuleSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const module = await modulesService.update(req.params.moduleId, parsed.data);
    if (!module) { res.status(404).json({ error: 'Modul nicht gefunden' }); return; }
    res.json(module);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Moduls' });
  }
}

export async function removeModule(req: AuthRequest, res: Response) {
  try {
    const deleted = await modulesService.remove(req.params.moduleId);
    if (!deleted) { res.status(404).json({ error: 'Modul nicht gefunden' }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Fehler beim Löschen des Moduls' });
  }
}

export async function reorderModules(req: AuthRequest, res: Response) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) { res.status(400).json({ error: 'items Array erforderlich' }); return; }
    const modules = await modulesService.reorder(req.params.id, items);
    res.json(modules);
  } catch {
    res.status(500).json({ error: 'Fehler beim Sortieren der Module' });
  }
}

// ─── Documents ────────────────────────────────────────────

export async function getDocuments(req: AuthRequest, res: Response) {
  try {
    const documents = await documentsService.getByProject(req.params.id);
    res.json(documents);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Dokumente' });
  }
}

export async function generateDocument(req: AuthRequest, res: Response) {
  try {
    const parsed = generateDocumentSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const document = await documentsService.generate(req.params.id, parsed.data.type, parsed.data.title, req.user!.id);
    res.status(201).json(document);
  } catch (err) {
    if (err instanceof Error && err.message.includes('nicht gefunden')) {
      res.status(404).json({ error: err.message });
      return;
    }
    res.status(500).json({ error: 'Fehler beim Generieren des Dokuments' });
  }
}

export async function removeDocument(req: AuthRequest, res: Response) {
  try {
    const deleted = await documentsService.remove(req.params.docId);
    if (!deleted) { res.status(404).json({ error: 'Dokument nicht gefunden' }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Fehler beim Löschen des Dokuments' });
  }
}

// ─── Activities ───────────────────────────────────────────

export async function getActivities(req: AuthRequest, res: Response) {
  try {
    const activities = await activitiesService.getByProject(req.params.id);
    res.json(activities);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Aktivitäten' });
  }
}

export async function createActivity(req: AuthRequest, res: Response) {
  try {
    const parsed = createActivitySchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const activity = await activitiesService.create(
      req.params.id,
      req.user!.id,
      parsed.data.type,
      parsed.data.description,
      parsed.data.metadata
    );
    res.status(201).json(activity);
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen der Aktivität' });
  }
}
