import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Name erforderlich'),
  short_description: z.string().optional(),
  description: z.string().optional(),
  includes: z.string().optional(),
  base_price: z.number().min(0),
  price_model: z.enum(['einmalig', 'monatlich']),
  type: z.enum(['paket', 'addon']),
  category: z.string().optional(),
  sort_order: z.number().int().optional(),
  commission_rate: z.number().min(0).max(100).optional(),
});

export const updateServiceSchema = createServiceSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export const createUserSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein'),
  name: z.string().min(1, 'Name erforderlich'),
  role: z.enum(['admin', 'employee']).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  role: z.enum(['admin', 'employee']).optional(),
  is_active: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen lang sein'),
});
