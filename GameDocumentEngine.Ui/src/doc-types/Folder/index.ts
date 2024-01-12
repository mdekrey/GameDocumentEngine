import { HiOutlineFolder } from 'react-icons/hi2';
import { defineDocument } from '@/documents/defineDocument';
import { Sheet } from './sheet';
import folderSchema from './schema';
import type { z } from 'zod';
import { fixup } from './fixup';
import { NamedIconWidgetDefinition } from '@/components/named-icon/named-icon-widget';

defineDocument('Folder', {
	icon: HiOutlineFolder,
	template: {} satisfies z.infer<typeof folderSchema>,
	component: Sheet,
	schema: folderSchema,
	fixup: fixup,
	widgets: {
		Name: NamedIconWidgetDefinition,
	},
});
