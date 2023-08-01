import { ZodNull, z } from 'zod';
import { documentSchema } from '../defineDocument';
import characterSchema from './schema';

export type Character = z.infer<typeof characterSchema>;
export const CharacterDocument = documentSchema<Character>(characterSchema);
export type CharacterDocument = z.infer<typeof CharacterDocument>;
export interface Skill {
	advancement: {
		passes: number;
		fails: number;
	};
	rating: number;
	name: string;
}

export const skillSchema: z.ZodType<Skill> = characterSchema.shape[
	'skills'
].element.options.filter(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	<T>(n: ZodNull | T): n is T => !(n instanceof ZodNull),
)[0];
