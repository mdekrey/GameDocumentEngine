import type { z } from 'zod';
import { documentSchema } from '@/documents/defineDocument';
import schema from './schema';

export type Character = z.infer<typeof schema>;
export const CharacterDocument = documentSchema<Character>(schema);
export type CharacterDocument = z.infer<typeof CharacterDocument>;
