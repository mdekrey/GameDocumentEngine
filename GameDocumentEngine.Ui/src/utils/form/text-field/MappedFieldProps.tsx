import { FieldMapping, UseFieldResult } from '../useField';

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
