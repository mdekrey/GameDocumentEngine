import { UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { CharacterDocument } from '../character-types';
import { useDebugValue } from 'react';

export function Wises({ form }: { form: UseFormResult<CharacterDocument> }) {
	const fields = useFormFields(form, {});
	useDebugValue(fields);
	return <></>;
}
