import { HiOutlineClock } from 'react-icons/hi2';
import { defineDocument } from '../defineDocument';
import { Clock } from './clock-widget';
import type clockSchema from './schema';
import type { z } from 'zod';
import en from './en.json';

defineDocument('Clock', {
	icon: HiOutlineClock,
	template: {
		current: 0,
		max: 6,
	} satisfies z.infer<typeof clockSchema>,
	component: Clock,
	translations: { en },
});
