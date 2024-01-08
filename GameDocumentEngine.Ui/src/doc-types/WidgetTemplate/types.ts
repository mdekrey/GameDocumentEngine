import type { z } from 'zod';
import type { WidgetBase, WidgetSettings } from '@/documents/defineDocument';
import { documentSchema } from '@/documents/defineDocument';
import schema from './schema';

export type WidgetTemplate = z.infer<typeof schema>;
export type Widget<TWidget extends WidgetBase = WidgetBase> = {
	position: {
		x: number;
		y: number;
		width: number;
		height: number;
	};
	widget: string;
	settings: WidgetSettings<TWidget>;
};
true satisfies WidgetTemplate['widgets'][string] extends Widget ? true : false;
export const WidgetTemplateDocument = documentSchema<WidgetTemplate>(schema);
export type CharacterDocument = z.infer<typeof WidgetTemplateDocument>;
