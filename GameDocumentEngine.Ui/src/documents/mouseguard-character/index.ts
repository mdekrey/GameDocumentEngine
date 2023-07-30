import { GiSeatedMouse } from 'react-icons/gi';
import { defineDocument } from '../defineDocument';
import { FullCharacterSheet } from './character-sheet';
import characterSchema from './schema';
import { z } from 'zod';
import en from './en.json';

defineDocument('MouseGuard-Character', {
	icon: GiSeatedMouse,
	template: {
		bio: {},
		skills: [],
		conditions: {},
		abilities: {
			nature: { current: 1, max: 1, advancement: { passes: 0, fails: 0 } },
			will: { rating: 0, advancement: { passes: 0, fails: 0 } },
			health: { rating: 0, advancement: { passes: 0, fails: 0 } },
			resources: { rating: 0, advancement: { passes: 0, fails: 0 } },
			circles: { rating: 0, advancement: { passes: 0, fails: 0 } },
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
	component: FullCharacterSheet,
	translations: { en },
});
