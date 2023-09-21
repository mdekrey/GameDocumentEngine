import { ErrorsList } from '../errors/errors-list';
import { Field } from '../field/field';
import { TextareaInput } from './textarea-input';
import type { FieldMapping, UseFieldResult } from '@/utils/form/useField';
import type { FieldProps } from '../FieldProps';
import type { JotaiLabel } from '../../jotai/label';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { useTwMerge } from '../../jotai/useTwMerge';
import {
	integerMapping,
	undefinedAsEmptyStringMapping,
	undefinedOrIntegerMapping,
} from '../text-input/text-field';
import { useMemo } from 'react';

export type TextareaFieldPersistentProps = {
	description?: boolean;
	labelClassName?: string;
	inputClassName?: string;
	contentsClassName?: string;
} & React.ComponentProps<typeof JotaiLabel>;
export type TextareaFieldProps = FieldProps<string> &
	TextareaFieldPersistentProps;

export function TextareaField(props: TextareaFieldProps) {
	const htmlProps = props.field.htmlProps();
	const {
		field: { translation: t, errors },
		description,
		labelClassName,
		inputClassName,
		contentsClassName,
		...fieldProps
	} = props;
	const disabledLabelClassName = useTwMerge(
		useComputedAtom((get) => (get(htmlProps.disabled) ? 'text-slate-500' : '')),
		labelClassName,
	);
	return (
		<Field {...fieldProps}>
			<Field.Label className={disabledLabelClassName}>
				{t(['label'])}
			</Field.Label>
			<Field.Contents className={contentsClassName}>
				<TextareaInput {...htmlProps} className={inputClassName} />
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
		const newField = useMemo(() => field.applyMapping(mapping), [field]);
		return <TextareaField field={newField} {...defaults} {...props} />;
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
