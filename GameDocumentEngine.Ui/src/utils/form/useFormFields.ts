import { useMemo } from 'react';
import type { Objectish } from 'immer';
import type { UseFormResult, UseFieldsResult } from './useForm';
import { buildFormFields } from './useForm';
import type { FieldsConfig } from './field-config-types';

export function useFormFields<
	T extends Objectish,
	const TFields extends FieldsConfig<T>,
>(
	form: UseFormResult<T>,
	fields: TFields,
): UseFieldsResult<T, TFields>['fields'] {
	return useMemo(
		() => buildFormFields<T, TFields>(fields, form),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
}
