import type { Objectish } from 'immer';
import type {
	UseFormResult,
	UseFieldsResult,
	FormFieldReturnType,
	FormFieldReturnTypeFromConfig,
} from './useForm';
import { buildFormField, buildFormFields } from './useForm';
import type {
	BaseAnyFieldConfig,
	FieldConfig,
	FieldsConfig,
	InferredFieldConfig,
	InferredFieldConfigParams,
} from './field-config-types';
import { useConstant } from './useConstant';
import type { Path, PathValue } from './path';

export function useFormFields<
	T extends Objectish,
	const TFields extends FieldsConfig<T>,
>(
	form: UseFormResult<T>,
	fields: TFields,
): UseFieldsResult<T, TFields>['fields'] {
	return useConstant(() => buildFormFields<T, TFields>(fields, form));
}
// export function useFormField<
// 	T extends Objectish,
// 	TPath extends Path<T> = Path<T>,
// 	TValue = PathValue<T, TPath>,
// >(
// 	form: UseFormResult<T>,
// 	field: FieldConfig<T, TPath, TValue>,
// ): never; /* TODO */
export function useFormField<
	T extends Objectish,
	const TField extends BaseAnyFieldConfig<T>,
>(
	form: UseFormResult<T>,
	field: TField & InferredFieldConfig<T, TField>,
): FormFieldReturnTypeFromConfig<T, TField>; /* TODO */
export function useFormField<
	T extends Objectish,
	const TField extends BaseAnyFieldConfig<T>,
>(
	form: UseFormResult<T>,
	field: TField & InferredFieldConfig<T, TField>,
): FormFieldReturnTypeFromConfig<T, TField> {
	return useConstant(() => buildFormField<T, TField>(field, form));
}
