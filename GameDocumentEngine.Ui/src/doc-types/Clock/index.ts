import { HiOutlineClock } from 'react-icons/hi2';
import { defineDocument } from '@/documents/defineDocument';
import { Clock } from './clock-widget';
import clockSchema from './schema';
import type { z } from 'zod';
// import en from './en.json?url';

defineDocument('Clock', {
	icon: HiOutlineClock,
	template: {
		current: 0,
		max: 6,
	} satisfies z.infer<typeof clockSchema>,
	component: Clock,
	schema: clockSchema,
	translations: {},
	fixup: {
		toForm: (a) => a,
		fromForm: (a) => a,
	},
});
