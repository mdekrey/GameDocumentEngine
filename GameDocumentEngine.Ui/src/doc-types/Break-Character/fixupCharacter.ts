import type { FieldMapping } from '@/utils/form';
import type { CharacterDocument } from './character-types';
import { produce } from 'immer';

export const characterFixup: FieldMapping<
	CharacterDocument,
	CharacterDocument
> = {
	toForm(this: void, networkValue: CharacterDocument): CharacterDocument {
		return produce(networkValue, (draft) => {
			draft.details.identity.languages ??= [];
		});
	},
	fromForm(this: void, currentValue: CharacterDocument): CharacterDocument {
		return produce(currentValue, (draft) => {
			if (!draft.details.identity.languages?.length) {
				delete draft.details.identity.languages;
			}
		});
	},
};
