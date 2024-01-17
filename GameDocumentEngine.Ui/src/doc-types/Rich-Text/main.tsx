import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { RichText } from './types';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { RichTextField } from '@/components/rich-text/RichTextField';
import { useFormFields } from '@principlestudios/react-jotai-forms';

export function RichTextMain(props: GameObjectFormComponent<RichText>) {
	useSubmitOnChange(props.form, props.onSubmit);

	const { contentField } = useFormFields(props.form, {
		contentField: ['details', 'content'],
	});

	return (
		<>
			<TextField field={props.form.field(['name'])} />
			<RichTextField field={contentField} />
		</>
	);
}
