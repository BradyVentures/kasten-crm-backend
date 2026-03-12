import { z } from 'zod';

const leadStatusEnum = z.enum(['neu', 'kontaktiert', 'qualifiziert', 'angebot', 'gewonnen', 'verloren']);
const activityTypeEnum = z.enum(['anruf', 'email', 'notiz']);

export const createLeadSchema = z.object({
  company_name: z.string().min(1, 'Firmenname erforderlich'),
  contact_person: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  source: z.string().optional(),
  notes: z.string().optional(),
  assigned_to: z.string().uuid().nullable().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const updateStatusSchema = z.object({
  status: leadStatusEnum,
});

export const assignLeadSchema = z.object({
  assigned_to: z.string().uuid().nullable(),
});

export const addActivitySchema = z.object({
  type: activityTypeEnum,
  description: z.string().min(1, 'Beschreibung erforderlich'),
});

export const importConfirmSchema = z.object({
  import_id: z.string(),
  column_mapping: z.record(z.number()),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'Mindestens eine ID erforderlich'),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
