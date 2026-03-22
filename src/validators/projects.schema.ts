import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Titel erforderlich'),
  customer_id: z.string().uuid().optional().or(z.literal('')),
  prospect_name: z.string().optional(),
  prospect_contact: z.string().optional(),
  prospect_email: z.string().email().optional().or(z.literal('')),
  prospect_phone: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['entwurf', 'angebot', 'beauftragt', 'in_arbeit', 'abgeschlossen', 'storniert']).optional(),
  estimated_start: z.string().optional(),
  estimated_end: z.string().optional(),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  customer_id: z.string().uuid().nullable().optional().or(z.literal('')),
  prospect_name: z.string().nullable().optional(),
  prospect_contact: z.string().nullable().optional(),
  prospect_email: z.string().email().nullable().optional().or(z.literal('')),
  prospect_phone: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['entwurf', 'angebot', 'beauftragt', 'in_arbeit', 'abgeschlossen', 'storniert']).optional(),
  estimated_start: z.string().nullable().optional(),
  estimated_end: z.string().nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional().or(z.literal('')),
});

export const createModuleSchema = z.object({
  name: z.string().min(1, 'Name erforderlich'),
  category: z.enum(['design', 'entwicklung', 'marketing', 'beratung', 'hosting', 'wartung', 'sonstiges']),
  description: z.string().optional(),
  internal_cost: z.number().min(0).optional(),
  external_cost: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  hourly_rate: z.number().min(0).optional(),
  estimated_hours: z.number().min(0).optional(),
  complexity: z.enum(['einfach', 'mittel', 'komplex', 'sehr_komplex']).optional(),
  phase: z.string().optional(),
  estimated_weeks: z.number().min(0).optional(),
  tech_stack: z.string().optional(),
  dependencies: z.string().optional(),
  risks: z.string().optional(),
  dsgvo_notes: z.string().optional(),
  sort_order: z.number().int().optional(),
});

export const updateModuleSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum(['design', 'entwicklung', 'marketing', 'beratung', 'hosting', 'wartung', 'sonstiges']).optional(),
  description: z.string().nullable().optional(),
  internal_cost: z.number().min(0).nullable().optional(),
  external_cost: z.number().min(0).nullable().optional(),
  price: z.number().min(0).nullable().optional(),
  hourly_rate: z.number().min(0).nullable().optional(),
  estimated_hours: z.number().min(0).nullable().optional(),
  complexity: z.enum(['einfach', 'mittel', 'komplex', 'sehr_komplex']).nullable().optional(),
  phase: z.string().nullable().optional(),
  estimated_weeks: z.number().min(0).nullable().optional(),
  tech_stack: z.string().nullable().optional(),
  dependencies: z.string().nullable().optional(),
  risks: z.string().nullable().optional(),
  dsgvo_notes: z.string().nullable().optional(),
  sort_order: z.number().int().nullable().optional(),
  status: z.enum(['geplant', 'in_arbeit', 'abgeschlossen', 'pausiert']).optional(),
});

export const createActivitySchema = z.object({
  type: z.enum(['notiz', 'anruf', 'email', 'meeting', 'status_aenderung', 'erstellt', 'dokument']),
  description: z.string().min(1, 'Beschreibung erforderlich'),
  metadata: z.record(z.unknown()).optional(),
});

export const generateDocumentSchema = z.object({
  type: z.enum(['briefing', 'angebot', 'kalkulation', 'protokoll', 'sonstiges']),
  title: z.string().min(1, 'Titel erforderlich'),
});
