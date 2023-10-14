import type { FieldMapping } from '@/utils/form';
import type { FolderDocument } from './types';

export const fixup: FieldMapping<FolderDocument, FolderDocument> = {
	toForm(this: void, networkValue: FolderDocument): FolderDocument {
		return networkValue;
	},
	fromForm(this: void, currentValue: FolderDocument): FolderDocument {
		return currentValue;
	},
};
