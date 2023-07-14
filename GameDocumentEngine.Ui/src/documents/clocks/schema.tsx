import { z } from 'zod';

export const schema = z.object({
	current: z.number().int().describe('The current value of the clock.'),
	max: z.number().int().describe('The maximum value of the clock.'),
});
