import { HiOutlineClock } from 'react-icons/hi';
import { defineDocument } from '../defineDocument';
import { Clock } from './clock-widget';
import clockSchema from './schema';
import { z } from 'zod';

defineDocument('Clock', {
	// TODO: figure out why this is giving a warning
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	icon: HiOutlineClock,
	template: {
		current: 0,
		max: 6,
	} satisfies z.infer<typeof clockSchema>,
	component: Clock,
});
