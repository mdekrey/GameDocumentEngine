import { ErrorsList } from '../errors/errors-list';
import { Field } from '../field/field';
import { TextareaInput } from './textarea-input';
import type { FieldMapping, UseFieldResult } from '@/utils/form/useField';
import type { MappedFieldProps } from '../MappedFieldProps';
import type { JotaiLabel } from '../../jotai/label';
import type { Atom } from 'jotai';
import { isAtom, useComputedAtom } from '@principlestudios/jotai-react-signals';
import { useTwMerge } from '../../jotai/useTwMerge';
import {
	integerMapping,
	undefinedAsEmptyStringMapping,
	undefinedOrIntegerMapping,
} from '../text-input/text-field';

export type TextareaFieldPersistentProps = {
	description?: boolean;
	labelClassName?: string;
	inputClassName?: string;
	contentsClassName?: string;
	disabled?: boolean | Atom<boolean>;
	readOnly?: boolean;
} & React.ComponentProps<typeof JotaiLabel>;
export type TextareaFieldProps<TValue> = MappedFieldProps<TValue, string> &
	TextareaFieldPersistentProps;

export function TextareaField<T>(props: TextareaFieldProps<T>) {
	const htmlProps =
		'mapping' in props
			? props.field.htmlProps(props.mapping)
			: props.field.htmlProps();
	const {
		field: { translation: t, errors },
		description,
		labelClassName,
		inputClassName,
		contentsClassName,
		disabled,
		readOnly,
		...fieldProps
	} = props;
	const disablableLabelClassName = useTwMerge(
		useComputedAtom((get) =>
			(isAtom(disabled) ? get(disabled) : disabled) ? 'text-slate-500' : '',
		),
		labelClassName,
	);
	return (
		<Field {...fieldProps}>
			<Field.Label className={disablableLabelClassName}>
				{t(['label'])}
			</Field.Label>
			<Field.Contents className={contentsClassName}>
				<TextareaInput
					disabled={disabled}
					{...htmlProps}
					className={inputClassName}
					readOnly={readOnly}
				/>
				{description && <p className="text-xs italic">{t(['description'])}</p>}
				<ErrorsList errors={errors} translations={t} />
			</Field.Contents>
		</Field>
	);
}

export function applyMappingToTextareaField<
	T,
	TDefaults extends Partial<TextareaFieldPersistentProps>,
>(
	displayName: string,
	mapping: FieldMapping<T, string>,
	defaults: TDefaults,
): (
	props: {
		field: UseFieldResult<T, { hasErrors: true; hasTranslations: true }>;
	} & Omit<TextareaFieldPersistentProps, keyof TDefaults>,
) => React.ReactNode;
export function applyMappingToTextareaField<T>(
	displayName: string,
	mapping: FieldMapping<T, string>,
): (
	props: {
		field: UseFieldResult<T, { hasErrors: true; hasTranslations: true }>;
	} & TextareaFieldPersistentProps,
) => React.ReactNode;
export function applyMappingToTextareaField<T>(
	displayName: string,
	mapping: FieldMapping<T, string>,
	defaults?: Partial<TextareaFieldPersistentProps>,
) {
	function Result({
		field,
		...props
	}: {
		field: UseFieldResult<T, { hasErrors: true; hasTranslations: true }>;
	} & TextareaFieldPersistentProps) {
		return (
			<TextareaField field={field} mapping={mapping} {...defaults} {...props} />
		);
	}
	Result.displayName = displayName;
	return Result;
}

TextareaField.AllowUndefined = applyMappingToTextareaField(
	'TextareaFieldWithUndefined',
	undefinedAsEmptyStringMapping,
);
TextareaField.Integer = applyMappingToTextareaField(
	'IntegerTextareaField',
	integerMapping,
);
TextareaField.UndefinedOrInteger = applyMappingToTextareaField(
	'UndefinedOrIntegerrTextField',
	undefinedOrIntegerMapping,
);
