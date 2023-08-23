import { useStore } from 'jotai';
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
	const store = useStore();
	return useMemo(
		() =>
			buildFormFields<T, TFields>(fields, {
				pathPrefix: form.pathPrefix,
				translationPath: form.translationPath,
				schema: form.schema,
				errorStrategy: form.errorStrategy,
				formTranslation: form.formTranslation,
				store,
				atomFamily: form.atomFamily,
				formEvents: form.formEvents,
				defaultValue: form.defaultValue,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);
}
