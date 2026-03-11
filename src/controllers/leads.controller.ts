import { Response } from 'express';
import multer from 'multer';
import ExcelJS from 'exceljs';
import { AuthRequest } from '../types/index.js';
import * as leadsService from '../services/leads.service.js';
import { createLeadSchema, updateLeadSchema, updateStatusSchema, assignLeadSchema, addActivitySchema, importConfirmSchema, bulkDeleteSchema } from '../validators/leads.schema.js';

const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });
export const uploadMiddleware = upload.single('file');

export async function getAll(req: AuthRequest, res: Response) {
  try {
    const result = await leadsService.getAll({
      status: req.query.status as string,
      assigned_to: req.query.assigned_to as string,
      search: req.query.search as string,
      bundesland: req.query.bundesland as string,
      missing_field: req.query.missing_field as string,
      sort_by: req.query.sort_by as string,
      sort_order: req.query.sort_order as string,
      page: parseInt(req.query.page as string) || 1,
      per_page: parseInt(req.query.per_page as string) || 50,
    });
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Leads' });
  }
}

export async function getDistinctValues(req: AuthRequest, res: Response) {
  try {
    const values = await leadsService.getDistinctValues();
    res.json(values);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Filterwerte' });
  }
}

export async function bulkDelete(req: AuthRequest, res: Response) {
  try {
    const parsed = bulkDeleteSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const result = await leadsService.bulkDelete(parsed.data.ids);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Fehler beim Löschen der Leads' });
  }
}

export async function getById(req: AuthRequest, res: Response) {
  try {
    const lead = await leadsService.getById(req.params.id);
    if (!lead) { res.status(404).json({ error: 'Lead nicht gefunden' }); return; }
    res.json(lead);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden des Leads' });
  }
}

export async function create(req: AuthRequest, res: Response) {
  try {
    const parsed = createLeadSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const lead = await leadsService.create(parsed.data, req.user!.id);
    res.status(201).json(lead);
  } catch {
    res.status(500).json({ error: 'Fehler beim Erstellen des Leads' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const parsed = updateLeadSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const lead = await leadsService.update(req.params.id, parsed.data);
    if (!lead) { res.status(404).json({ error: 'Lead nicht gefunden' }); return; }
    res.json(lead);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Leads' });
  }
}

export async function updateStatus(req: AuthRequest, res: Response) {
  try {
    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const lead = await leadsService.updateStatus(req.params.id, parsed.data.status, req.user!.id);
    if (!lead) { res.status(404).json({ error: 'Lead nicht gefunden' }); return; }
    res.json(lead);
  } catch {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Status' });
  }
}

export async function assign(req: AuthRequest, res: Response) {
  try {
    const parsed = assignLeadSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const lead = await leadsService.assign(req.params.id, parsed.data.assigned_to, req.user!.id);
    if (!lead) { res.status(404).json({ error: 'Lead nicht gefunden' }); return; }
    res.json(lead);
  } catch {
    res.status(500).json({ error: 'Fehler beim Zuweisen des Leads' });
  }
}

export async function getActivities(req: AuthRequest, res: Response) {
  try {
    const activities = await leadsService.getActivities(req.params.id);
    res.json(activities);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Aktivitäten' });
  }
}

export async function addActivity(req: AuthRequest, res: Response) {
  try {
    const parsed = addActivitySchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    await leadsService.addActivity(req.params.id, req.user!.id, parsed.data.type, parsed.data.description);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Fehler beim Hinzufügen der Aktivität' });
  }
}

export async function importExcel(req: AuthRequest, res: Response) {
  try {
    if (!req.file) { res.status(400).json({ error: 'Keine Datei hochgeladen' }); return; }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.worksheets[0];
    if (!worksheet) { res.status(400).json({ error: 'Keine Arbeitsblätter gefunden' }); return; }

    const headers: string[] = [];
    const rows: string[][] = [];

    worksheet.eachRow((row, rowNumber) => {
      const values = row.values as (string | number | null)[];
      // ExcelJS row.values is 1-indexed, shift to 0-indexed
      const cells = values.slice(1).map(v => v?.toString() || '');

      if (rowNumber === 1) {
        headers.push(...cells);
      } else {
        rows.push(cells);
      }
    });

    const result = await leadsService.parseImport(headers, rows);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Fehler beim Parsen der Excel-Datei' });
  }
}

export async function confirmImport(req: AuthRequest, res: Response) {
  try {
    const parsed = importConfirmSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return; }
    const result = await leadsService.confirmImport(parsed.data.import_id, parsed.data.column_mapping, req.user!.id);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Import fehlgeschlagen';
    res.status(400).json({ error: message });
  }
}

export async function convertToCustomer(req: AuthRequest, res: Response) {
  try {
    const customer = await leadsService.convertToCustomer(req.params.id, req.user!.id);
    res.status(201).json(customer);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Konvertierung fehlgeschlagen';
    res.status(400).json({ error: message });
  }
}

export async function acquireLock(req: AuthRequest, res: Response) {
  try {
    const result = await leadsService.acquireLock(req.params.id, req.user!.id);
    if (!result.locked) { res.status(409).json(result); return; }
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Fehler beim Sperren' });
  }
}

export async function releaseLock(req: AuthRequest, res: Response) {
  try {
    const result = await leadsService.releaseLock(req.params.id, req.user!.id);
    res.json(result);
  } catch {
    res.status(500).json({ error: 'Fehler beim Entsperren' });
  }
}

export async function getAllLocks(req: AuthRequest, res: Response) {
  try {
    const locks = await leadsService.getAllLocks();
    res.json(locks);
  } catch {
    res.status(500).json({ error: 'Fehler beim Laden der Sperren' });
  }
}
