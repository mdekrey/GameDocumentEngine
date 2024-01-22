import type { z } from 'zod';
import type schema from './schema';

export type RichText = z.infer<typeof schema>;
