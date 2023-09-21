import { Atom, atom, type useStore } from 'jotai';
import type { StandardWritableAtom } from './StandardWritableAtom';
import { mapAtom, noChange } from './mapAtom';
import {
	createErrorsAtom,
	createTriggeredErrorsAtom,
} from './createErrorsAtom';
import {
	noErrorsAtom,
	type CheckboxHtmlProps,
	type ControlledHtmlProps,
	type FieldMapping,
	type FieldOptions,
	type FieldStateBoolean,
	type FieldStateContext,
	type InputHtmlProps,
	type ToHtmlInputProps,
	type ToHtmlProps,
	type UseFieldResult,
} from './useField';
import { FieldEvents } from './events/FieldEvents';
import type { RegisterErrorStrategy } from './errorsStrategy';
import type { ZodType } from 'zod';

function toFieldStateAtom<TValue>(
	value: FieldStateBoolean<TValue>,
	context: FieldStateContext<TValue>,
): Atom<boolean> {
	return typeof value === 'boolean'
		? atom(value)
		: typeof value === 'function'
		? value(context)
		: value;
}

const identity = <T>(orig: T) => orig;
export function toInternalFieldAtom<TValue, TFieldValue>(
	store: ReturnType<typeof useStore>,
	fieldValueAtom: StandardWritableAtom<TValue>,
	options: Partial<FieldOptions<TValue, TFieldValue>> = {},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): UseFieldResult<TFieldValue, any> {
	const fieldEvents = new FieldEvents(options.formEvents);
	const mapping: FieldMapping<TValue, TFieldValue> =
		('mapping' in options ? options.mapping : undefined) ??
		({
			// mapping should only be missing if TValue === TFieldValue
			toForm: identity,
			fromForm: identity,
		} as unknown as FieldMapping<TValue, TFieldValue>);
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

	const fieldStateContext: FieldStateContext<TValue> = {
		value: fieldValueAtom,
		errors: errors ?? noErrorsAtom,
	};
	const disabled = toFieldStateAtom<TValue>(
		options.disabled ?? false,
		fieldStateContext,
	);
	const readOnly = toFieldStateAtom<TValue>(
		options.readOnly ?? false,
		fieldStateContext,
	);

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
		applyMapping: <TNew>(
			newMapping: FieldMapping<TFieldValue, TNew>,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		): UseFieldResult<TNew, any> => {
			const newOptions: Partial<FieldOptions<TValue, TNew>> = {
				...options,
				mapping: {
					toForm: (v) => newMapping.toForm(mapping.toForm(v)),
					fromForm: (v) => {
						const newResult = newMapping.fromForm(v);
						return newResult === noChange
							? noChange
							: mapping.fromForm(newResult);
					},
				},
			};
			return {
				...toInternalFieldAtom(store, fieldValueAtom, newOptions),
				disabled,
				readOnly,
				errors,
			};
		},
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
		// TODO: if this isn't a string, we shouldn't create this function; instead, we should set {}
		const toInput = function toInput(): InputHtmlProps {
			const htmlAtom = formValueAtom as unknown as StandardWritableAtom<string>;
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

		// TODO: if this isn't a boolean, we shouldn't create this function; instead, we should set undefined
		toInput.asCheckbox = function asCheckbox(): CheckboxHtmlProps {
			const htmlAtom =
				formValueAtom as unknown as StandardWritableAtom<boolean>;
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
			console.log('change', ev);
			if (store.get(disabled) || store.get(readOnly)) return;
			fieldEvents.dispatchEvent(FieldEvents.Change);
			setValue(ev.currentTarget.value);
		},
		onBlur: (ev) => {
			console.log('blur', ev);
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
