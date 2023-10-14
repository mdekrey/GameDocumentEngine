import type { UseFieldResult } from '@/utils/form';

export type FieldProps<TTarget> = {
	field: UseFieldResult<TTarget, { hasErrors: true; hasTranslations: true }>;
};
