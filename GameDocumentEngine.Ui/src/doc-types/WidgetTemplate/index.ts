import { HiOutlineTableCells } from 'react-icons/hi2';
import { defineDocument } from '@/documents/defineDocument';
import schema from './schema';
import type { z } from 'zod';
import { produce } from 'immer';
import { CreateWidgetTemplate } from './create';
import { WidgetTemplateRouter } from './router';

const template: z.infer<typeof schema> = {
	docType: '',
	widgets: {},
};

defineDocument('WidgetTemplate', {
	icon: HiOutlineTableCells,
	template,
	component: WidgetTemplateRouter,
	creationComponent: CreateWidgetTemplate,
	schema,
	fixup: {
		toForm: (widgetTemplate) =>
			produce(widgetTemplate, (draft) => {
				for (const id of Object.keys(draft.details.widgets)) {
					// since settings are now required at least as an empty object, this makes sure they're populated
					draft.details.widgets[id].settings ??= {};
				}
			}),
		fromForm: (a) => a,
	},
});
