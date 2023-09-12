import { Atom, atom, type useStore } from 'jotai';
import type { StandardWritableAtom } from './StandardWritableAtom';
import { mapAtom } from './mapAtom';
import {
	createErrorsAtom,
	createTriggeredErrorsAtom,
} from './createErrorsAtom';
import type {
	CheckboxHtmlProps,
	ControlledHtmlProps,
	FieldMapping,
	FieldOptions,
	InputHtmlProps,
	ToHtmlInputProps,
	ToHtmlProps,
	UseFieldResult,
} from './useField';
import { FieldEvents } from './events/FieldEvents';
import type { RegisterErrorStrategy } from './errorsStrategy';
import type { ZodType } from 'zod';

function toFieldStateAtom(value: boolean | Atom<boolean>) {
	return typeof value === 'boolean' ? atom(value) : value;
}

export function toInternalFieldAtom<TValue, TFieldValue>(
	store: ReturnType<typeof useStore>,
	fieldValueAtom: StandardWritableAtom<TValue>,
	options: Partial<FieldOptions<TValue, TFieldValue>> = {},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): UseFieldResult<TFieldValue, any> {
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

	const disabled = toFieldStateAtom(options.disabled ?? false);
	const readOnly = toFieldStateAtom(options.readOnly ?? false);

	const setValue = (v: TFieldValue | ((prev: TFieldValue) => TFieldValue)) => {
		if (store.get(disabled) || store.get(readOnly)) return;
		store.set(formValueAtom, v);
	};

	return {
		value: formValueAtom,
		disabled,
		readOnly,
		setValue,
		getValue: () => store.get(formValueAtom),
		errors,
		translation: options.translation,
		onChange(v: TFieldValue | ((prev: TFieldValue) => TFieldValue)) {
			fieldEvents.dispatchEvent(FieldEvents.Change);
			setValue(v);
		},
		onBlur() {
			fieldEvents.dispatchEvent(FieldEvents.Blur);
		},
		htmlProps: buildHtmlProps(),
	};

	function createErrorStrategyAtom(
		schema: ZodType<TValue>,
		strategy: RegisterErrorStrategy,
	) {
		const [result, trigger] = createTriggeredErrorsAtom(fieldValueAtom, schema);
		strategy(fieldEvents, () => store.set(trigger));
		return result;
	}

	function buildHtmlProps(): ToHtmlProps<TFieldValue> {
		function mappedAtom<T>(mapping?: FieldMapping<TFieldValue, T> | undefined) {
			return mapping
				? mapAtom<TFieldValue, T>(
						formValueAtom,
						mapping.toForm,
						mapping.fromForm,
				  )
				: (formValueAtom as unknown as StandardWritableAtom<T>);
		}

		const toInput = function toInput(
			mapping?: FieldMapping<TFieldValue, string>,
		): InputHtmlProps {
			const htmlAtom = mappedAtom(mapping);
			return toInputTextField(
				store,
				(v) => store.set(htmlAtom, v),
				() => store.get(htmlAtom),
				htmlAtom,
				fieldEvents,
				disabled,
				readOnly,
			);
		} as ToHtmlInputProps<TFieldValue> as ToHtmlProps<TFieldValue>;
		toInput.asControlled =
			function asControlled(): ControlledHtmlProps<TFieldValue> {
				return toControlledField(
					store,
					(v) => store.set(formValueAtom, v),
					formValueAtom,
					fieldEvents,
					disabled,
					readOnly,
				);
			};
		toInput.asCheckbox = function asCheckbox(
			mapping?: FieldMapping<TFieldValue, boolean>,
		): CheckboxHtmlProps {
			const htmlAtom = mappedAtom(mapping);
			return toInputCheckboxField(
				store,
				(v) => store.set(htmlAtom, v),
				() => store.get(htmlAtom),
				htmlAtom,
				fieldEvents,
				disabled,
				readOnly,
			);
		} as ToHtmlProps<TFieldValue>['asCheckbox'];

		return toInput;
	}
}

function toControlledField<T>(
	store: ReturnType<typeof useStore>,
	setValue: (v: T) => void,
	atom: StandardWritableAtom<T>,
	fieldEvents: FieldEvents,
	disabled: Atom<boolean>,
	readOnly: Atom<boolean>,
): ControlledHtmlProps<T> {
	return {
		value: atom,
		onChange: (ev) => {
			if (store.get(disabled) || store.get(readOnly)) return;
			fieldEvents.dispatchEvent(FieldEvents.Change);
			setValue(ev.currentTarget.value);
		},
		onBlur: () => {
			fieldEvents.dispatchEvent(FieldEvents.Blur);
		},
		disabled,
		readOnly,
	};
}

function toInputTextField(
	store: ReturnType<typeof useStore>,
	setValue: (v: string) => void,
	getValue: () => string,
	atom: Atom<string>,
	fieldEvents: FieldEvents,
	disabled: Atom<boolean>,
	readOnly: Atom<boolean>,
): InputHtmlProps {
	return {
		defaultValue: atom,
		onChange: (ev) => {
			if (store.get(disabled) || store.get(readOnly)) return;
			fieldEvents.dispatchEvent(FieldEvents.Change);
			setValue(ev.currentTarget.value);
		},
		onBlur: (ev) => {
			fieldEvents.dispatchEvent(FieldEvents.Blur);
			ev.currentTarget.value = getValue();
		},
		disabled,
		readOnly,
	};
}

function toInputCheckboxField(
	store: ReturnType<typeof useStore>,
	setValue: (v: boolean) => void,
	getValue: () => boolean,
	atom: StandardWritableAtom<boolean>,
	fieldEvents: FieldEvents,
	disabled: Atom<boolean>,
	readOnly: Atom<boolean>,
): CheckboxHtmlProps {
	return {
		defaultChecked: atom,
		onChange: (ev) => {
			if (store.get(disabled) || store.get(readOnly)) return;
			fieldEvents.dispatchEvent(FieldEvents.Change);
			setValue(ev.currentTarget.checked);
		},
		onBlur: (ev) => {
			fieldEvents.dispatchEvent(FieldEvents.Blur);
			ev.currentTarget.checked = getValue();
		},
		disabled,
	};
}
