import type { z } from 'zod';
import { ZodNull } from 'zod';
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
export interface Wise {
	name: string;
	pass?: boolean;
	fail?: boolean;
	fate?: boolean;
	persona?: boolean;
}
export interface Trait {
	name: string;
	level: number;
	usedFor: number;
}

export const skillSchema: z.ZodType<Skill> = characterSchema.shape[
	'skills'
].element.options.filter(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	<T>(n: ZodNull | T): n is T => !(n instanceof ZodNull),
)[0];

export const wiseSchema: z.ZodType<Wise> = characterSchema.shape[
	'wises'
].element.options.filter(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	<T>(n: ZodNull | T): n is T => !(n instanceof ZodNull),
)[0];

export const traitSchema: z.ZodType<Trait> = characterSchema.shape[
	'traits'
].element.options.filter(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	<T>(n: ZodNull | T): n is T => !(n instanceof ZodNull),
)[0];
