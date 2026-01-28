import { z } from 'zod';
import { appSettingsSchema } from './app';

export const settingsUpdateSchema = appSettingsSchema.partial();

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
