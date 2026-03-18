import { z } from 'zod';

export const createTodoSchema = z.object({
  title: z.string().min(1, 'Titel erforderlich'),
  description: z.string().optional(),
  due_date: z.string().optional(),
  customer_id: z.string().uuid().optional().or(z.literal('')),
  customer_service_id: z.string().uuid().optional().or(z.literal('')),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
});

export const updateTodoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['offen', 'erledigt']).optional(),
  due_date: z.string().nullable().optional(),
  customer_id: z.string().uuid().nullable().optional().or(z.literal('')),
  customer_service_id: z.string().uuid().nullable().optional().or(z.literal('')),
  assigned_to: z.string().uuid().nullable().optional().or(z.literal('')),
});
