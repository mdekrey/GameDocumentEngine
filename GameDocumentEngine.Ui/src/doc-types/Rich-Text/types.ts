import type { z } from 'zod';
import type schema from './schema';
import type { OutputData } from '@editorjs/editorjs';

export type RichText = {
	content?: OutputData;
};
true satisfies RichText extends z.infer<typeof schema> ? true : false;
