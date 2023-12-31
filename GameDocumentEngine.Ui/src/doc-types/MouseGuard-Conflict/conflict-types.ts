import type { z } from 'zod';
import { documentSchema } from '@/documents/defineDocument';
import conflictSchema from './schema';

export type Conflict = z.infer<typeof conflictSchema>;
export const ConflictDocument = documentSchema<Conflict>(conflictSchema);
export type ConflictDocument = z.infer<typeof ConflictDocument>;
export const actionChoices = ['attack', 'defend', 'feint', 'maneuver'] as const;
export type ActionChoice = (typeof actionChoices)[number];
export interface SideState {
	name: string;
	disposition: {
		current: number;
		max: number;
	};
	choices: (ActionChoice | null)[];
	ready?: boolean;
	revealed?: ActionChoice[];
}

export const sideSchema: z.ZodType<SideState> = conflictSchema.shape['sideA'];

export type ConflictGeneral = ConflictDocument['details']['general'];
