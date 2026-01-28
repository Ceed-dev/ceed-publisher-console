import { z } from 'zod';

export const platformSchema = z.enum(['web', 'ios']);
export const appStatusSchema = z.enum(['active', 'suspended']);
export const contextLoggingModeSchema = z.enum(['none', 'truncated', 'hashed', 'full']);
export const supportedLanguageSchema = z.enum(['eng', 'jpn']);

export const appSettingsSchema = z.object({
  cooldownSeconds: z
    .number()
    .int()
    .min(0, 'Cooldown must be at least 0 seconds')
    .max(3600, 'Cooldown must be less than 1 hour'),
  allowedOrigins: z
    .array(z.string().url('Invalid URL format'))
    .max(20, 'Maximum 20 allowed origins'),
  supportedLanguages: z
    .array(supportedLanguageSchema)
    .min(1, 'At least one language required'),
  contextLoggingMode: contextLoggingModeSchema,
});

export const appCreateSchema = z.object({
  appName: z
    .string()
    .min(2, 'App name must be at least 2 characters')
    .max(100, 'App name must be less than 100 characters'),
  platforms: z
    .array(platformSchema)
    .min(1, 'At least one platform required'),
});

export const appUpdateSchema = z.object({
  appName: z
    .string()
    .min(2, 'App name must be at least 2 characters')
    .max(100, 'App name must be less than 100 characters')
    .optional(),
  platforms: z
    .array(platformSchema)
    .min(1, 'At least one platform required')
    .optional(),
  status: appStatusSchema.optional(),
  settings: appSettingsSchema.partial().optional(),
});

export type AppCreateInput = z.infer<typeof appCreateSchema>;
export type AppUpdateInput = z.infer<typeof appUpdateSchema>;
export type AppSettingsInput = z.infer<typeof appSettingsSchema>;
