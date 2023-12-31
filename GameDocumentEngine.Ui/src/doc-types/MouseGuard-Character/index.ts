import { GiSeatedMouse } from 'react-icons/gi';
import { defineDocument } from '@/documents/defineDocument';
import { CharacterSheet } from './character-sheet';
import characterSchema from './schema';
import type { z } from 'zod';
import { characterFixup } from './fixupCharacter';

defineDocument('MouseGuard-Character', {
	icon: GiSeatedMouse,
	template: {
		bio: {},
		skills: [],
		conditions: {},
		abilities: {
			nature: { current: 1, max: 1, advancement: { passes: 0, fails: 0 } },
			will: { rating: 3, advancement: { passes: 0, fails: 0 } },
			health: { rating: 5, advancement: { passes: 0, fails: 0 } },
			resources: { rating: 2, advancement: { passes: 0, fails: 0 } },
			circles: { rating: 2, advancement: { passes: 0, fails: 0 } },
		},
		notes: {},
		personality: {},
		rewards: {
			fate: 0,
			persona: 0,
			checks: 0,
		},
		traits: [],
		wises: [],
	} satisfies z.infer<typeof characterSchema>,
	component: CharacterSheet,
	schema: characterSchema,
	fixup: characterFixup,
});
