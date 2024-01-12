import type { Size } from '@/documents/defineDocument';

export type NewWidgetResult = {
	id: string;
	size: Size;
	settings?: unknown;
};
