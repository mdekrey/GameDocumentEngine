import { z } from 'zod';
import { documentSchema } from '../defineDocument';
import characterSchema from './schema-improved';

export type Character = z.infer<typeof characterSchema>;
export const CharacterDocument = documentSchema<Character>(characterSchema);
export type CharacterDocument = z.infer<typeof CharacterDocument>;
