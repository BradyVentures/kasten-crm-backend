import { z } from 'zod';

export const DOCUMENT_CATEGORIES = [
  'Gesprächsleitfaden',
  'Service-Info',
  'Schulung',
  'Sonstiges',
] as const;

export const createDocumentSchema = z.object({
  title: z.string().min(1, 'Titel erforderlich'),
  description: z.string().optional(),
  category: z.enum(DOCUMENT_CATEGORIES).default('Sonstiges'),
});
