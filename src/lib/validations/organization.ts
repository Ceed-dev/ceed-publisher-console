import { z } from 'zod';

export const organizationCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters'),
});

export type OrganizationCreateInput = z.infer<typeof organizationCreateSchema>;
