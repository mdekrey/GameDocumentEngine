import { UseFieldResult } from '../form/useField';

export type FieldProps<TTarget> = {
	field: UseFieldResult<TTarget, { hasErrors: true; hasTranslations: true }>;
};
