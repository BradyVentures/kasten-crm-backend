import { z } from 'zod';

const projectStatusEnum = z.enum([
  'entwurf', 'angebot', 'verhandlung', 'beauftragt',
  'in_umsetzung', 'live', 'pausiert', 'abgebrochen',
]);

const moduleCategoryEnum = z.enum([
  'crm', 'ki_chatbot', 'ki_telefon', 'automatisierung',
  'routenplanung', 'website', 'seo_marketing', 'analytics', 'sonstiges',
]);

const complexityEnum = z.enum(['niedrig', 'mittel', 'hoch']);
const moduleStatusEnum = z.enum(['geplant', 'in_arbeit', 'fertig', 'pausiert']);

const documentTypeEnum = z.enum([
  'briefing', 'angebot', 'vertrag', 'av_vertrag',
  'kalkulation', 'statusbericht', 'technische_doku',
]);

const activityTypeEnum = z.enum([
  'erstellt', 'status_aenderung', 'modul_hinzugefuegt', 'modul_aktualisiert',
  'dokument_erstellt', 'notiz', 'meeting', 'kalkulation_aktualisiert',
]);

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Titel erforderlich'),
  customer_id: z.string().uuid().optional().or(z.literal('')),
  prospect_name: z.string().optional(),
  prospect_contact: z.string().optional(),
  prospect_email: z.string().email().optional().or(z.literal('')),
  prospect_phone: z.string().optional(),
  description: z.string().optional(),
  status: projectStatusEnum.optional(),
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
  status: projectStatusEnum.optional(),
  estimated_start: z.string().nullable().optional(),
  estimated_end: z.string().nullable().optional(),
  assigned_to: z.string().uuid().nullable().optional().or(z.literal('')),
});

export const createModuleSchema = z.object({
  name: z.string().min(1, 'Name erforderlich'),
  category: moduleCategoryEnum,
  description: z.string().optional(),
  setup_cost_internal: z.number().min(0).optional(),
  setup_price_customer: z.number().min(0).optional(),
  monthly_cost_internal: z.number().min(0).optional(),
  monthly_price_customer: z.number().min(0).optional(),
  estimated_hours: z.number().min(0).optional(),
  complexity: complexityEnum.optional(),
  phase: z.number().int().min(1).optional(),
  estimated_weeks: z.number().min(0).optional(),
  tech_stack: z.string().optional(),
  dependencies: z.string().optional(),
  risks: z.string().optional(),
  dsgvo_notes: z.string().optional(),
  sort_order: z.number().int().optional(),
});

export const updateModuleSchema = z.object({
  name: z.string().min(1).optional(),
  category: moduleCategoryEnum.optional(),
  description: z.string().nullable().optional(),
  setup_cost_internal: z.number().min(0).nullable().optional(),
  setup_price_customer: z.number().min(0).nullable().optional(),
  monthly_cost_internal: z.number().min(0).nullable().optional(),
  monthly_price_customer: z.number().min(0).nullable().optional(),
  estimated_hours: z.number().min(0).nullable().optional(),
  complexity: complexityEnum.nullable().optional(),
  phase: z.number().int().min(1).nullable().optional(),
  estimated_weeks: z.number().min(0).nullable().optional(),
  tech_stack: z.string().nullable().optional(),
  dependencies: z.string().nullable().optional(),
  risks: z.string().nullable().optional(),
  dsgvo_notes: z.string().nullable().optional(),
  sort_order: z.number().int().nullable().optional(),
  status: moduleStatusEnum.optional(),
});

export const createActivitySchema = z.object({
  type: activityTypeEnum,
  description: z.string().min(1, 'Beschreibung erforderlich'),
  metadata: z.record(z.unknown()).optional(),
});

export const generateDocumentSchema = z.object({
  type: documentTypeEnum,
  title: z.string().min(1, 'Titel erforderlich'),
});
