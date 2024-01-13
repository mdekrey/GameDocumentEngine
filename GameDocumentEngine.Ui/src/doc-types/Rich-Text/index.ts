import { HiOutlineDocumentText } from 'react-icons/hi2';
import { defineDocument } from '@/documents/defineDocument';
import schema from './schema';
import type { z } from 'zod';
import { RichTextMain } from './main';

const template: z.infer<typeof schema> = {
	content: '',
};

defineDocument('Rich-Text', {
	noContainer: true,
	icon: HiOutlineDocumentText,
	template,
	component: RichTextMain,
	schema,
	fixup: {
		toForm: (v) => v,
		fromForm: (v) => v,
	},
});
