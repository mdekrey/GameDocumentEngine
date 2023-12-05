import { type Objectish, produce } from 'immer';
import type { UseFormResult } from '@principlestudios/react-jotai-forms';
import { applyPatch, createPatch } from 'rfc6902';

export function updateFormDefault<T extends Objectish>(
	form: Pick<UseFormResult<T>, 'defaultValue' | 'set' | 'get'>,
	newValue: T,
) {
	if (form.defaultValue.current !== newValue) {
		const patch = createPatch(form.defaultValue.current, newValue);
		const oldDefault = form.defaultValue.current;
		form.defaultValue.current = newValue;

		const prev = form.get();

		/* "userChanges" is the changes the user made to the form values locally */
		const userChanges = createPatch(oldDefault, prev);
		// This process prevents changes coming over the network from repeating
		// local changes, such as adding array elements. Adding array elements
		// without this filtering creates duplicate entries. This really only
		// matters in the delay between typing and recording the "local"
		// mutations, so it needs to operate on the form.defaultValue.current
		// instead of applying operational transforms. Currently we just take
		// local user changes, since this means they're actively interacting
		// with it.
		const filteredPatch = patch.filter(
			(p) => !userChanges.some((userChange) => p.path === userChange.path),
		);

		// TODO: if filteredPatch has the same path as a path in userChanges but
		// is NOT the same, allow the user to handle conflicts...?
		if (filteredPatch.length > 0) {
			form.set((actualPrev) => {
				return produce(actualPrev, (draft) => {
					applyPatch(draft, filteredPatch);
				});
			});
		}
	}
}

export function updateFormDefaultMapped<TForm extends Objectish>(
	form: Pick<UseFormResult<TForm>, 'defaultValue' | 'set' | 'get'>,
	newValue: TForm,
) {
	updateFormDefault(form, newValue);
}
