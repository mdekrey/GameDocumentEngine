import type { FieldMapping } from '@/utils/form/useField';
import type { CharacterDocument } from './character-types';
import { produce } from 'immer';

export const characterFixup: FieldMapping<
	CharacterDocument,
	CharacterDocument
> = {
	toForm(this: void, networkValue: CharacterDocument): CharacterDocument {
		return produce(networkValue, (draft) => {
			if (draft.details?.bio) {
				draft.details.bio.age ??= undefined;
				draft.details.bio.cloakColor ??= undefined;
				draft.details.bio.enemy ??= undefined;
				draft.details.bio.friend ??= undefined;
				draft.details.bio.furColor ??= undefined;
				draft.details.bio.guardRank ??= undefined;
				draft.details.bio.home ??= undefined;
				draft.details.bio.mentor ??= undefined;
				draft.details.bio.parents ??= undefined;
				draft.details.bio.senior ??= undefined;
			}

			if (draft.details?.skills)
				while (draft.details.skills.length < 24) {
					draft.details.skills.push(null);
				}
			if (draft.details?.traits)
				while (draft.details.traits.length < 5) {
					draft.details.traits.push(null);
				}
			if (draft.details?.wises)
				while (draft.details.wises.length < 4) {
					draft.details.wises.push(null);
				}
		});
	},
	fromForm(this: void, currentValue: CharacterDocument): CharacterDocument {
		return produce(currentValue, (draft) => {
			if (draft.details?.skills)
				while (
					draft.details.skills.length > 0 &&
					draft.details.skills[draft.details.skills.length - 1] === null
				) {
					draft.details.skills.pop();
				}
			if (draft.details?.traits)
				while (
					draft.details.traits.length > 0 &&
					draft.details.traits[draft.details.traits.length - 1] === null
				) {
					draft.details.traits.pop();
				}
			if (draft.details?.wises)
				while (
					draft.details.wises.length > 0 &&
					draft.details.wises[draft.details.wises.length - 1] === null
				) {
					draft.details.wises.pop();
				}
		});
	},
};
