import type { z } from 'zod';
import type { WidgetBase, WidgetSettings } from '@/documents/defineDocument';
import type schema from './schema';

export type WidgetPosition = {
	x: number;
	y: number;
	width: number;
	height: number;
};
export type Dashboard = z.infer<typeof schema>;
export type Widget<TWidget extends WidgetBase = WidgetBase> = {
	documentId: string;
	position: WidgetPosition;
	widget: string;
	settings: WidgetSettings<TWidget>;
};
true satisfies Dashboard['widgets'][string] extends Widget ? true : false;
