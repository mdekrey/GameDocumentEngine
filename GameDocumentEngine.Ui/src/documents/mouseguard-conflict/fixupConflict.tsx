import type { FieldMapping } from '@/utils/form/useField';
import type { ConflictDocument } from './conflict-types';
import { produce } from 'immer';

export const conflictFixup: FieldMapping<ConflictDocument, ConflictDocument> = {
	toForm(this: void, networkValue: ConflictDocument): ConflictDocument {
		return produce(networkValue, (draft) => {
			if (draft.details.sideA) {
				// TODO: do we need anything here?
			}
		});
	},
	fromForm(this: void, currentValue: ConflictDocument): ConflictDocument {
		return produce(currentValue, (draft) => {
			if (draft.details.sideA) {
				// TODO: do we need anything here?
			}
		});
	},
};
