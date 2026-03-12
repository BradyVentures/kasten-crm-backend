import { z } from 'zod';

export const createCustomerSchema = z.object({
  company_name: z.string().min(1, 'Firmenname erforderlich'),
  contact_person: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  notes: z.string().optional(),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
});

export const updateCustomerSchema = z.object({
  company_name: z.string().min(1).optional(),
  contact_person: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  notes: z.string().optional(),
});

export const assignServiceSchema = z.object({
  service_id: z.string().uuid(),
  sold_price: z.number().min(0),
  price_model: z.enum(['einmalig', 'monatlich']),
  contract_months: z.number().int().min(1).optional(),
  sold_date: z.string().optional(),
  notes: z.string().optional(),
});
