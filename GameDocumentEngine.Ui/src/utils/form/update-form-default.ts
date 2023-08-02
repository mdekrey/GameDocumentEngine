import { type Objectish, produce } from 'immer';
import { type UseFormResult } from './useForm';
import { applyPatch, createPatch } from 'rfc6902';

export function updateFormDefault<T extends Objectish>(
	form: UseFormResult<T>,
	newValue: T,
	fixup?: (value: T) => T,
) {
	if (form.defaultValue.current !== newValue) {
		const patch = createPatch(form.defaultValue.current, newValue);
		const oldDefault = form.defaultValue.current;
		form.defaultValue.current = newValue;

		let prev = form.get();
		if (fixup) prev = fixup(prev);

		// This process prevents changes coming over the network from
		// repeating local changes, such as adding array elements. Adding array
		// elements without this filtering creates duplicate entries.
		/* "userChanges" is the changes the user made to the form values locally */
		const userChanges = createPatch(oldDefault, prev);
		const stringifiedUserChanges = userChanges.map((v) => JSON.stringify(v));
		const filteredPatch = patch.filter(
			(p) => !stringifiedUserChanges.includes(JSON.stringify(p)),
		);

		// TODO: if filteredPatch has the same path as a path in userChanges but is NOT the same,
		// allow the user to handle conflicts...?
		if (filteredPatch.length > 0) {
			form.set((actualPrev) => {
				return produce(actualPrev, (draft) => {
					applyPatch(draft, filteredPatch);
				});
			});
		}
	}
}
