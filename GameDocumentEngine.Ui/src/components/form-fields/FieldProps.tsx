import type { UseFieldResult } from '@/utils/form/useField';

export type FieldProps<TTarget> = {
	field: UseFieldResult<TTarget, { hasErrors: true; hasTranslations: true }>;
};
