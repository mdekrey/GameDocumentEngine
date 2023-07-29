import { UseFormResult, useFormFields } from '@/utils/form/useForm';
import { CharacterDocument } from '../character-types';
import { useDebugValue } from 'react';

export function Notes({ form }: { form: UseFormResult<CharacterDocument> }) {
	const fields = useFormFields(form, {});
	useDebugValue(fields);
	return <></>;
}
