import { ErrorsList } from '../jotai/errors/errors-list';
import { Field } from '../field/field';
import { TextInput } from '../text-input/text-input';
import { FieldMapping, UseFieldResult } from '../../form/useField';
import { MappedFieldProps } from '../MappedFieldProps';
import { noChange } from '../../form/mapAtom';
import { JotaiLabel } from '../jotai/label';

export const undefinedAsEmptyStringMapping: FieldMapping<
	string | undefined,
	string
> = {
	toForm: (v: string | undefined) => v ?? '',
	fromForm: (v) => (v ? v : undefined),
};

export const integerMapping: FieldMapping<number, string> = {
	toForm: (v: number) => v.toFixed(0),
	fromForm: (v) => {
		const result = Number.parseInt(v, 10);
		return isNaN(result) ? noChange : result;
	},
};

export const undefinedOrIntegerMapping: FieldMapping<
	number | undefined,
	string
> = {
	toForm: (v: number | undefined) => (v === undefined ? '' : v.toFixed(0)),
	fromForm: (v) => {
		if (!v) return undefined;
		const result = Number.parseInt(v, 10);
		return isNaN(result) ? noChange : result;
	},
};

export type TextFieldPersistentProps = {
	description?: boolean;
	type?: React.HTMLInputTypeAttribute;
	labelClassName?: string;
	inputClassName?: string;
	contentsClassName?: string;
} & React.ComponentProps<typeof JotaiLabel>;
export type TextFieldProps<TValue> = MappedFieldProps<TValue, string> &
	TextFieldPersistentProps;

export function TextField<T>(props: TextFieldProps<T>) {
	const htmlProps =
		'mapping' in props
			? props.field.htmlProps(props.mapping)
			: props.field.htmlProps();
	const {
		field: { translation: t, errors },
		type,
		description,
		labelClassName,
		inputClassName,
		contentsClassName,
		...fieldProps
	} = props;
	return (
		<Field {...fieldProps}>
			<Field.Label className={labelClassName}>{t(['label'])}</Field.Label>
			<Field.Contents className={contentsClassName}>
				<TextInput type={type} {...htmlProps} className={inputClassName} />
				{description && <p className="text-xs italic">{t(['description'])}</p>}
				<ErrorsList errors={errors} translations={t} />
			</Field.Contents>
		</Field>
	);
}

export function applyPropsToTextField<
	TProps extends Partial<TextFieldPersistentProps>,
>(displayName: string, defaults: TProps) {
	function Result<T>(props: TextFieldProps<T>) {
		return (
			<TextField<unknown>
				{...({ ...defaults, ...props } as TextFieldProps<unknown>)}
			/>
		);
	}
	Result.displayName = displayName;
	return Result as never as <T>(
		p: Omit<TextFieldProps<T>, keyof TProps>,
	) => React.ReactNode;
}

export function applyMappingToTextField<
	T,
	TDefaults extends Partial<TextFieldPersistentProps>,
>(
	displayName: string,
	mapping: FieldMapping<T, string>,
	defaults: TDefaults,
): (
	props: {
		field: UseFieldResult<T, { hasErrors: true; hasTranslations: true }>;
	} & Omit<TextFieldPersistentProps, keyof TDefaults>,
) => React.ReactNode;
export function applyMappingToTextField<T>(
	displayName: string,
	mapping: FieldMapping<T, string>,
): (
	props: {
		field: UseFieldResult<T, { hasErrors: true; hasTranslations: true }>;
	} & TextFieldPersistentProps,
) => React.ReactNode;
export function applyMappingToTextField<T>(
	displayName: string,
	mapping: FieldMapping<T, string>,
	defaults?: Partial<TextFieldPersistentProps>,
) {
	function Result({
		field,
		...props
	}: {
		field: UseFieldResult<T, { hasErrors: true; hasTranslations: true }>;
	} & TextFieldPersistentProps) {
		return (
			<TextField field={field} mapping={mapping} {...defaults} {...props} />
		);
	}
	Result.displayName = displayName;
	return Result;
}

TextField.AllowUndefined = applyMappingToTextField(
	'TextFieldWithUndefined',
	undefinedAsEmptyStringMapping,
);
TextField.Integer = applyMappingToTextField('IntegerTextField', integerMapping);
TextField.UndefinedOrInteger = applyMappingToTextField(
	'UndefinedOrIntegerrTextField',
	undefinedOrIntegerMapping,
);
