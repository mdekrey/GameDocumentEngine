import { useStore } from 'jotai';
import { StandardWritableAtom } from './StandardWritableAtom';
import { mapAtom } from './mapAtom';
import { createErrorsAtom } from './createErrorsAtom';
import { FieldOptions, UseFieldResult, toInputField } from './useField';

export function toInternalFieldAtom<TValue, TFieldValue>(
	store: ReturnType<typeof useStore>,
	fieldValueAtom: StandardWritableAtom<TValue>,
	options: Partial<FieldOptions<TValue, TFieldValue>> = {},
): UseFieldResult<TValue, TFieldValue, never> {
	const mapping = 'mapping' in options ? options.mapping : undefined;
	const formValueAtom = mapping
		? mapAtom<TValue, TFieldValue>(
				fieldValueAtom,
				mapping.toForm,
				mapping.fromForm,
		  )
		: (fieldValueAtom as unknown as StandardWritableAtom<TFieldValue>);

	const schema = 'schema' in options ? options.schema : null;
	const errors = schema ? createErrorsAtom(fieldValueAtom, schema) : undefined;

	const standardProps = toInputField(store, formValueAtom);

	const result: UseFieldResult<TValue, TFieldValue, never> = {
		valueAtom: fieldValueAtom,
		setValue: (v: TValue) => store.set(fieldValueAtom, v),
		getValue: () => store.get(fieldValueAtom),
		standardProps,
		errors,
	};
	return result;
}
