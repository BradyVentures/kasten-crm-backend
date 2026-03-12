import { z } from 'zod';

export const updateInfoPageSchema = z.object({
  content: z.string().min(0),
});
