import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import * as emailTemplatesService from '../services/email-templates.service.js';
import { createEmailTemplateSchema, updateEmailTemplateSchema } from '../validators/email-templates.schema.js';

export async function getAll(req: AuthRequest, res: Response) {
  try {
    const templates = await emailTemplatesService.getAll();
    res.json(templates);
  } catch (err) {
    console.error('Error fetching email templates:', err);
    res.status(500).json({ error: 'Fehler beim Laden der E-Mail-Vorlagen' });
  }
}

export async function getCategories(req: AuthRequest, res: Response) {
  try {
    const categories = await emailTemplatesService.getCategories();
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Kategorien' });
  }
}

export async function create(req: AuthRequest, res: Response) {
  const parsed = createEmailTemplateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  try {
    const template = await emailTemplatesService.create(parsed.data, req.user!.id);
    res.status(201).json(template);
  } catch (err) {
    console.error('Error creating email template:', err);
    res.status(500).json({ error: 'Fehler beim Erstellen der Vorlage' });
  }
}

export async function update(req: AuthRequest, res: Response) {
  const parsed = updateEmailTemplateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  try {
    const template = await emailTemplatesService.update(req.params.id, parsed.data, req.user!.id);
    if (!template) {
      return res.status(404).json({ error: 'Vorlage nicht gefunden' });
    }
    res.json(template);
  } catch (err) {
    console.error('Error updating email template:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Vorlage' });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    await emailTemplatesService.remove(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting email template:', err);
    res.status(500).json({ error: 'Fehler beim Löschen der Vorlage' });
  }
}
