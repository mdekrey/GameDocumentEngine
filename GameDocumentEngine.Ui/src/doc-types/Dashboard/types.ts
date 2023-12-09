import type { z } from 'zod';
import { documentSchema } from '@/documents/defineDocument';
import schema from './schema';

export type Dashboard = z.infer<typeof schema>;
export type Widget = Dashboard['widgets'][string];
export const DashboardDocument = documentSchema<Dashboard>(schema);
export type CharacterDocument = z.infer<typeof DashboardDocument>;
