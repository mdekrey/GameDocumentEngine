import { faker } from '@faker-js/faker';
import { memo } from 'react';

export const LoremBlock = memo(
	({
		sentenceCount = 3,
		paragraphCount = 5,
	}: {
		sentenceCount?: number;
		paragraphCount?: number;
	}) =>
		Array(paragraphCount)
			.fill(0)
			.map((_, idx) => (
				<p key={idx} className="my-4">
					{faker.lorem.paragraph(sentenceCount)}
				</p>
			)),
);
