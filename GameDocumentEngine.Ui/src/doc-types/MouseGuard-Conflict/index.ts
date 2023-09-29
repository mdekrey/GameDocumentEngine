import { GiSwordsEmblem } from 'react-icons/gi';
import { defineDocument } from '@/documents/defineDocument';
import { ConflictSheet } from './conflict-sheet';
import conflictSchema from './schema';
import type { z } from 'zod';
// import './en.json?url';
import { conflictFixup } from './fixupConflict';

defineDocument('MouseGuard-Conflict', {
	icon: GiSwordsEmblem,
	template: {
		general: {
			type: 'Combat',
			skills: {
				attack: ['hunter', 'fighter'],
				defend: ['nature', 'scout'],
				feint: ['hunter', 'fighter'],
				maneuver: ['nature', 'scout'],
			},
		},
		sideA: {
			name: 'Side A',
			disposition: {
				current: 1,
				max: 1,
			},
			ready: false,
			choices: [],
		},
		sideB: {
			name: 'Side B',
			disposition: {
				current: 1,
				max: 1,
			},
			ready: false,
			choices: [],
		},
	} satisfies z.infer<typeof conflictSchema>,
	component: ConflictSheet,
	schema: conflictSchema,
	fixup: conflictFixup,
});
