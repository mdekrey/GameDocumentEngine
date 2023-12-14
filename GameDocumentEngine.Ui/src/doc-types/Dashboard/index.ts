import { HiOutlineTableCells } from 'react-icons/hi2';
import { defineDocument } from '@/documents/defineDocument';
import schema from './schema';
import type { z } from 'zod';
import { produce } from 'immer';
import { DashboardRouter } from './router';

const template: z.infer<typeof schema> = {
	widgets: {},
};

defineDocument('Dashboard', {
	noContainer: true,
	icon: HiOutlineTableCells,
	template,
	component: DashboardRouter,
	schema,
	fixup: {
		toForm: (dashboard) =>
			produce(dashboard, (draft) => {
				for (const id of Object.keys(draft.details.widgets)) {
					// since settings are now required at least as an empty object, this makes sure they're populated
					draft.details.widgets[id].settings ??= {};
				}
			}),
		fromForm: (a) => a,
	},
});
