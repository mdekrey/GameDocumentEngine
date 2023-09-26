import type { Objectish } from 'immer';
import type { UseFormResult, UseFieldsResult } from './useForm';
import { buildFormFields } from './useForm';
import type { FieldsConfig } from './field-config-types';
import { useConstant } from './useConstant';

export function useFormFields<
	T extends Objectish,
	const TFields extends FieldsConfig<T>,
>(
	form: UseFormResult<T>,
	fields: TFields,
): UseFieldsResult<T, TFields>['fields'] {
	return useConstant(() => buildFormFields<T, TFields>(fields, form));
}
