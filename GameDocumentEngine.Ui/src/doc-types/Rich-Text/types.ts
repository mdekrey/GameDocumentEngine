import type { z } from 'zod';
import type schema from './schema';
import type { RichTextData } from '@/components/rich-text';

export type RichText = {
	content?: RichTextData;
	mdx?: string;
};
true satisfies RichText extends z.infer<typeof schema> ? true : false;
