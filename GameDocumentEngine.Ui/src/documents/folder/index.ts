import { HiOutlineFolder } from 'react-icons/hi2';
import { defineDocument } from '../defineDocument';
import { Sheet } from './sheet';
import folderSchema from './schema';
import type { z } from 'zod';
// import en from './en.json';
import { fixup } from './fixup';

defineDocument('Folder', {
	icon: HiOutlineFolder,
	template: {} satisfies z.infer<typeof folderSchema>,
	component: Sheet,
	schema: folderSchema,
	translations: {},
	fixup: fixup,
});
