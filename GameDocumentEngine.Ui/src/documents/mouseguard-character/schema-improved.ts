import { z } from 'zod';

// TODO: this file should be generated
export const bio = z
	.object({
		age: z.number().int(),
		home: z.string(),
		furColor: z.string(),
		guardRank: z.string(),
		cloakColor: z.string(),
		parents: z.string(),
		senior: z.string(),
		mentor: z.string(),
		friend: z.string(),
		enemy: z.string(),
	})
	.partial();

export const skill = z.object({
	name: z.string(),
	rank: z.number().int(),
	passes: z.number().int(),
	fails: z.number().int(),
});

export default z.object({
	bio: bio,
	skills: z.array(skill),
});
