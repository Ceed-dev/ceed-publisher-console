import { z } from 'zod';

export const memberRoleSchema = z.enum(['owner', 'developer', 'analyst']);

export const memberInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: memberRoleSchema,
});

export const memberUpdateSchema = z.object({
  role: memberRoleSchema,
});

export type MemberInviteInput = z.infer<typeof memberInviteSchema>;
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;
