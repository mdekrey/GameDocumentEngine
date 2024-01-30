import { ErrorsList } from '../errors/errors-list';
import { Field } from '../field/field';
import { TextareaInput } from './textarea-input';
import type { FieldMapping } from '@/utils/form';
import type { FieldProps } from '../FieldProps';
import type { JotaiLabel } from '../../jotai/label';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { useTwMerge } from '../../jotai/useTwMerge';
import {
	integerMapping,
	undefinedAsEmptyStringMapping,
	undefinedOrIntegerMapping,
} from '../text-input/text-field';
import { useMemo, useRef } from 'react';
import { useAtomSubscription } from '@/utils/useAtomSubscription';

export type TextareaFieldPersistentProps = {
	description?: boolean;
	labelClassName?: string;
	inputClassName?: string;
	contentsClassName?: string;
} & React.ComponentProps<typeof JotaiLabel>;
export type TextareaFieldProps = FieldProps<string> &
	TextareaFieldPersistentProps;

export function TextareaField(props: TextareaFieldProps) {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
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
	useAtomSubscription(
		props.field.value,
		function adjustHeight() {
			const textarea = textareaRef.current;
			if (!textarea) return;
			const expectedHeight =
				textarea.offsetHeight - textarea.clientHeight + textarea.scrollHeight;
			if (expectedHeight > textarea.offsetHeight)
				textarea.style.height = `${expectedHeight + 1}px`;
		},
		true,
	);
	return (
		<Field {...fieldProps}>
			<Field.Label className={disabledLabelClassName}>
				{t(['label'])}
			</Field.Label>
			<Field.Contents className={contentsClassName}>
				<TextareaInput
					ref={textareaRef}
					{...htmlProps}
					className={inputClassName}
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
	props: FieldProps<T> & Omit<TextareaFieldPersistentProps, keyof TDefaults>,
) => React.ReactNode;
export function applyMappingToTextareaField<T>(
	displayName: string,
	mapping: FieldMapping<T, string>,
): (props: FieldProps<T> & TextareaFieldPersistentProps) => React.ReactNode;
export function applyMappingToTextareaField<T>(
	displayName: string,
	mapping: FieldMapping<T, string>,
	defaults?: Partial<TextareaFieldPersistentProps>,
) {
	function Result({
		field,
		...props
	}: FieldProps<T> & TextareaFieldPersistentProps) {
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
