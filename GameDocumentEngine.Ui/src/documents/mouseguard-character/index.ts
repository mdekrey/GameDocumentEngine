import { HiOutlineClock } from 'react-icons/hi2';
import { defineDocument } from '../defineDocument';
import { FullCharacterSheet } from './character-sheet';
import characterSchema from './schema-improved';
import { z } from 'zod';
import en from './en.json';

defineDocument('MouseGuard-Character', {
	// TODO: Research: why this is giving a warning
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	icon: HiOutlineClock,
	template: {
		bio: {},
		skills: [],
	} satisfies z.infer<typeof characterSchema>,
	component: FullCharacterSheet,
	translations: { en },
});
