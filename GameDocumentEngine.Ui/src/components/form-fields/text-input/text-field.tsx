import { ErrorsList } from '../errors/errors-list';
import { Field } from '../field/field';
import { TextInput } from './text-input';
import type { FieldMapping } from '@/utils/form';
import type { FieldProps } from '../FieldProps';
import { noChange } from '@/utils/form';
import type { JotaiLabel } from '../../jotai/label';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { useTwMerge } from '../../jotai/useTwMerge';
import { useMemo } from 'react';
import { elementTemplate } from '@/components/template';

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
export type TextFieldProps = FieldProps<string> & TextFieldPersistentProps;

function BaseTextField(props: TextFieldProps) {
	const htmlProps = props.field.htmlProps();
	const {
		field: { translation: t, errors },
		type,
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
				<TextInput type={type} {...htmlProps} className={inputClassName} />
				{description && <p className="text-xs italic">{t(['description'])}</p>}
				<ErrorsList errors={errors} translations={t} />
			</Field.Contents>
		</Field>
	);
}

export function textFieldMappingOptions<T>(mapping: FieldMapping<T, string>) {
	return {
		useProps({
			field,
			...props
		}: FieldProps<T> & TextFieldPersistentProps): TextFieldProps {
			const newField = useMemo(() => field.applyMapping(mapping), [field]);
			return { field: newField, ...props };
		},
	};
}

const template = elementTemplate(
	'TextField',
	BaseTextField as React.FC<TextFieldProps>,
	(T) => <T />,
);
export const TextField = Object.assign(template, {
	AllowUndefined: template.extend('TextField.AllowUndefined', (T) => <T />, {
		...textFieldMappingOptions(undefinedAsEmptyStringMapping),
	}),
});
