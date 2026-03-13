import { z } from 'zod';

export const createPromotionSchema = z.object({
  name: z.string().min(1, 'Name erforderlich'),
  description: z.string().optional(),
  discount_type: z.enum(['fixed', 'percentage']),
  discount_value: z.number().min(0),
  valid_from: z.string().optional().nullable(),
  valid_until: z.string().optional().nullable(),
  max_redemptions: z.number().int().min(1).optional().nullable(),
  applicable_service_ids: z.array(z.string().uuid()).optional().nullable(),
}).refine(
  (data) => data.discount_type !== 'percentage' || data.discount_value <= 100,
  { message: 'Prozent-Rabatt darf maximal 100% betragen', path: ['discount_value'] }
);

export const updatePromotionSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  discount_type: z.enum(['fixed', 'percentage']).optional(),
  discount_value: z.number().min(0).optional(),
  valid_from: z.string().optional().nullable(),
  valid_until: z.string().optional().nullable(),
  max_redemptions: z.number().int().min(1).optional().nullable(),
  applicable_service_ids: z.array(z.string().uuid()).optional().nullable(),
  is_active: z.boolean().optional(),
});
