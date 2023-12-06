import { HiOutlineTableCells } from 'react-icons/hi2';
import { defineDocument } from '@/documents/defineDocument';
import { Dashboard } from './dashboard';
import schema from './schema';
import type { z } from 'zod';

const template: z.infer<typeof schema> = {
	widgets: {},
};

defineDocument('Dashboard', {
	noContainer: true,
	icon: HiOutlineTableCells,
	template,
	component: Dashboard,
	schema,
	fixup: {
		toForm: (a) => a,
		fromForm: (a) => a,
	},
});
