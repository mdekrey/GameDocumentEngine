import { useStore } from 'jotai';
import { useMemo } from 'react';
import { Objectish } from 'immer';
import { UseFormResult, UseFieldsResult, buildFormFields } from './useForm';
import { FieldsConfig } from './field-config-types';

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
				translationPathPrefix: form.translationPathPrefix,
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
