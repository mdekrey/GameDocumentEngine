import type { z } from 'zod';
import { documentSchema } from '@/documents/defineDocument';
import ClockSchema from './schema';

export type Clock = z.infer<typeof ClockSchema>;
export const ClockDocument = documentSchema<Clock>(ClockSchema);
export type ClockDocument = z.infer<typeof ClockDocument>;
