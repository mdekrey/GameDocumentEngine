import { UseFormResult, useFormFields } from '@/utils/form/useForm';
import { CharacterDocument } from '../character-types';
import { useDebugValue } from 'react';

export function Traits({ form }: { form: UseFormResult<CharacterDocument> }) {
	const fields = useFormFields(form, {});
	useDebugValue(fields);
	return <></>;
}
