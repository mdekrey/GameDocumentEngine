import { defineDocument } from '../defineDocument';
import { Clock } from './widget';
import clockSchema from './schema';
import { z } from 'zod';

defineDocument('Clock', {
	template: {
		current: 0,
		max: 6,
	} satisfies z.infer<typeof clockSchema>,
	component: Clock,
});
