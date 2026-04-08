import { z } from 'zod';

export const createCustomerSchema = z.object({
  company_name: z.string().min(1, 'Name oder Firmenname erforderlich'),
  contact_person: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  notes: z.string().optional(),
  customer_number: z.string().optional(),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
});

export const updateCustomerSchema = z.object({
  company_name: z.string().min(1).optional(),
  contact_person: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  notes: z.string().optional(),
  customer_number: z.string().optional(),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
});
