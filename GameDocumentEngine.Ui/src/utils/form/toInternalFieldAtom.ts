import { useStore } from 'jotai';
import { StandardWritableAtom } from './StandardWritableAtom';
import { mapAtom } from './mapAtom';
import {
	createErrorsAtom,
	createTriggeredErrorsAtom,
} from './createErrorsAtom';
import {
	CheckboxHtmlProps,
	FieldMapping,
	FieldOptions,
	InputHtmlProps,
	ToHtmlInputProps,
	ToHtmlProps,
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

	const setValue = (v: TFieldValue | ((prev: TFieldValue) => TFieldValue)) =>
		store.set(formValueAtom, v);

	return {
		value: formValueAtom,
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
				(v) => store.set(htmlAtom, v),
				() => store.get(htmlAtom),
				htmlAtom,
				fieldEvents,
			);
		} as ToHtmlInputProps<TFieldValue> as ToHtmlProps<TFieldValue>;
		toInput.asCheckbox = function asCheckbox(
			mapping?: FieldMapping<TFieldValue, boolean>,
		): CheckboxHtmlProps {
			const htmlAtom = mappedAtom(mapping);
			return toInputCheckboxField(
				(v) => store.set(htmlAtom, v),
				() => store.get(htmlAtom),
				htmlAtom,
				fieldEvents,
			);
		} as ToHtmlProps<TFieldValue>['asCheckbox'];

		return toInput;
	}
}

function toInputTextField(
	setValue: (v: string) => void,
	getValue: () => string,
	atom: StandardWritableAtom<string>,
	fieldEvents: FieldEvents,
): InputHtmlProps {
	return {
		defaultValue: atom,
		onChange: (ev) => {
			fieldEvents.dispatchEvent(FieldEvents.Change);
			setValue(ev.currentTarget.value);
		},
		onBlur: (ev) => {
			fieldEvents.dispatchEvent(FieldEvents.Blur);
			ev.currentTarget.value = getValue();
		},
	};
}

function toInputCheckboxField(
	setValue: (v: boolean) => void,
	getValue: () => boolean,
	atom: StandardWritableAtom<boolean>,
	fieldEvents: FieldEvents,
): CheckboxHtmlProps {
	return {
		defaultChecked: atom,
		onChange: (ev) => {
			fieldEvents.dispatchEvent(FieldEvents.Change);
			setValue(ev.currentTarget.checked);
		},
		onBlur: (ev) => {
			fieldEvents.dispatchEvent(FieldEvents.Blur);
			ev.currentTarget.checked = getValue();
		},
	};
}
