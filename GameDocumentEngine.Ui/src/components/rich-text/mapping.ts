import type { FieldMapping } from '@principlestudios/react-jotai-forms';
import type { RichTextData } from './type';

export const upgradingRichTextMapping: FieldMapping<
	string | RichTextData | undefined,
	RichTextData | undefined
> = {
	toForm(v) {
		if (!v) return undefined;
		if (typeof v === 'string')
			return {
				blocks: [
					{
						id: 'oldplaintext',
						data: {
							text: v
								.replace(/&/g, '&amp;')
								.replace(/</g, '&lt;')
								.replace(/>/g, '&gt;')
								.replace(/\n/g, '<br />'),
						},
						type: 'paragraph',
					},
				],
			};
		return v;
	},
	fromForm(v) {
		return v;
	},
};
