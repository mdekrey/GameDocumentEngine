import { useStore } from 'jotai';
import { StandardWritableAtom } from './StandardWritableAtom';
import { mapAtom } from './mapAtom';
import {
	createErrorsAtom,
	createTriggeredErrorsAtom,
} from './createErrorsAtom';
import {
	CheckboxFieldProps,
	FieldOptions,
	InputFieldProps,
	UseFieldResult,
} from './useField';
import { FieldEvents } from './events/FieldEvents';
import { RegisterErrorStrategy } from './errorsStrategy';
import { ZodType } from 'zod';

export function toInternalFieldAtom<TValue, TFieldValue>(
	store: ReturnType<typeof useStore>,
	fieldValueAtom: StandardWritableAtom<TValue>,
	options: Partial<FieldOptions<TValue, TFieldValue>> = {},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): UseFieldResult<TValue, TFieldValue, any> {
	const fieldEvents = new FieldEvents(options.formEvents);
	const mapping = 'mapping' in options ? options.mapping : undefined;
	const formValueAtom = mapping
		? mapAtom<TValue, TFieldValue>(
				fieldValueAtom,
				mapping.toForm,
				mapping.fromForm,
		  )
		: (fieldValueAtom as unknown as StandardWritableAtom<TFieldValue>);

	const schema = 'schema' in options ? options.schema : null;
	const errors = schema
		? options.errorStrategy
			? createErrorStrategyAtom(schema, options.errorStrategy)
			: createErrorsAtom(fieldValueAtom, schema)
		: undefined;

	const standardProps = options.isCheckbox
		? toInputCheckboxField(store, formValueAtom, fieldEvents)
		: toInputTextField(store, formValueAtom, fieldEvents);

	return {
		valueAtom: fieldValueAtom,
		setValue: (v: TValue) => store.set(fieldValueAtom, v),
		getValue: () => store.get(fieldValueAtom),
		standardProps,
		errors,
		translation: options.translation,
	} as never;

	function createErrorStrategyAtom(
		schema: ZodType<TValue>,
		strategy: RegisterErrorStrategy,
	) {
		const [result, trigger] = createTriggeredErrorsAtom(fieldValueAtom, schema);
		strategy(fieldEvents, () => store.set(trigger));
		return result;
	}
}

export function toInputTextField<TFieldValue>(
	store: ReturnType<typeof useStore>,
	atom: StandardWritableAtom<TFieldValue>,
	fieldEvents: FieldEvents,
): InputFieldProps<TFieldValue> {
	return {
		defaultValue: atom,
		onChange: (ev: React.ChangeEvent<{ value: TFieldValue }>) => {
			fieldEvents.dispatchEvent(FieldEvents.Change);
			console.log({ newValue: ev.currentTarget.value });
			store.set(atom, ev.currentTarget.value);
		},
		onBlur: () => {
			fieldEvents.dispatchEvent(FieldEvents.Blur);
		},
	};
}

export function toInputCheckboxField<TFieldValue>(
	store: ReturnType<typeof useStore>,
	atom: StandardWritableAtom<TFieldValue>,
	fieldEvents: FieldEvents,
): CheckboxFieldProps<TFieldValue> {
	return {
		defaultChecked: atom,
		onChange: (ev: React.ChangeEvent<{ checked: TFieldValue }>) => {
			fieldEvents.dispatchEvent(FieldEvents.Change);
			store.set(atom, ev.currentTarget.checked);
		},
		onBlur: () => {
			fieldEvents.dispatchEvent(FieldEvents.Blur);
		},
	};
}
