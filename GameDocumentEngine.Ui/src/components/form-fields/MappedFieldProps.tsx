import type { FieldMapping, UseFieldResult } from '@/utils/form/useField';

// TODO: consider not allowing mappings, since useFormFields works well
export type MappedFieldProps<TValue, TTarget> =
	| {
			field: UseFieldResult<TValue, { hasErrors: true; hasTranslations: true }>;
			mapping: FieldMapping<TValue, TTarget>;
	  }
	| {
			field: UseFieldResult<
				TTarget,
				{ hasErrors: true; hasTranslations: true }
			>;
	  };
