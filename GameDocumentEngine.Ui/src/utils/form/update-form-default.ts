import { type Objectish, produce } from 'immer';
import { type UseFormResult } from './useForm';
import { applyPatch, createPatch } from 'rfc6902';

export function updateFormDefault<T extends Objectish>(
	form: UseFormResult<T>,
	newValue: T,
) {
	if (form.defaultValue.current !== newValue) {
		const patch = createPatch(form.defaultValue.current, newValue);
		form.defaultValue.current = newValue;

		form.set((prev) =>
			produce(prev, (draft) => {
				applyPatch(draft, patch);
			}),
		);
	}
}
