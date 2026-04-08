import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name erforderlich'),
  email: z.string().email('Ungueltige E-Mail'),
  password: z.string().min(6, 'Mindestens 6 Zeichen'),
  role: z.enum(['admin', 'employee']).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'employee']).optional(),
  is_active: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Mindestens 6 Zeichen'),
});
