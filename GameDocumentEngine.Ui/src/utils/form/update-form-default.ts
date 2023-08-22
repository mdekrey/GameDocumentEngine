import { type Objectish, produce } from 'immer';
import { type UseFormResult } from './useForm';
import { applyPatch, createPatch } from 'rfc6902';
import type { FieldMapping } from './useField';

export function updateFormDefault<T extends Objectish>(
	form: Pick<UseFormResult<T>, 'defaultValue' | 'set' | 'get'>,
	newValue: T,
) {
	if (form.defaultValue.current !== newValue) {
		const patch = createPatch(form.defaultValue.current, newValue);
		const oldDefault = form.defaultValue.current;
		form.defaultValue.current = newValue;

		const prev = form.get();

		// This process prevents changes coming over the network from
		// repeating local changes, such as adding array elements. Adding array
		// elements without this filtering creates duplicate entries.
		/* "userChanges" is the changes the user made to the form values locally */
		const userChanges = createPatch(oldDefault, prev);
		const filteredPatch = patch.filter(
			(p) =>
				!userChanges.some(
					(userChange) => createPatch(p, userChange).length === 0,
				),
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

export function updateFormDefaultMapped<
	T extends Objectish,
	TForm extends Objectish,
>(
	form: Pick<UseFormResult<TForm>, 'defaultValue' | 'set' | 'get'>,
	newValue: T,
	fixupFormValues: FieldMapping<T, TForm>,
) {
	updateFormDefault(form, fixupFormValues.toForm(newValue));
}
