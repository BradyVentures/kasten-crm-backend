import { z } from 'zod';

export const createEmailTemplateSchema = z.object({
  title: z.string().min(1, 'Titel erforderlich'),
  subject: z.string().optional().default(''),
  body: z.string().optional().default(''),
  category: z.string().min(1, 'Kategorie erforderlich').default('Allgemein'),
  sort_order: z.number().int().optional().default(0),
});

export const updateEmailTemplateSchema = z.object({
  title: z.string().min(1).optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  category: z.string().min(1).optional(),
  sort_order: z.number().int().optional(),
});
