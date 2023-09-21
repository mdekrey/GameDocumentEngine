import type { FieldMapping } from '@/utils/form/useField';
import type { ConflictDocument } from './conflict-types';

export const conflictFixup: FieldMapping<ConflictDocument, ConflictDocument> = {
	toForm(this: void, networkValue: ConflictDocument): ConflictDocument {
		return networkValue;
	},
	fromForm(this: void, currentValue: ConflictDocument): ConflictDocument {
		return currentValue;
	},
};
