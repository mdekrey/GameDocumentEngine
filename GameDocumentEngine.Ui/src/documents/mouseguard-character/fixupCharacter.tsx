import { CharacterDocument } from './character-types';
import { produce } from 'immer';

export function fixupCharacter(
	currentValue: CharacterDocument,
): CharacterDocument {
	return produce(currentValue, (draft) => {
		while (
			draft.details.skills.length > 0 &&
			draft.details.skills[draft.details.skills.length - 1] === null
		) {
			draft.details.skills.pop();
		}
		while (
			draft.details.traits.length > 0 &&
			draft.details.traits[draft.details.traits.length - 1] === null
		) {
			draft.details.traits.pop();
		}
		while (
			draft.details.wises.length > 0 &&
			draft.details.wises[draft.details.wises.length - 1] === null
		) {
			draft.details.wises.pop();
		}
	});
}
