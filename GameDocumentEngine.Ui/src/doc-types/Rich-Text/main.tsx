import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { RichText } from './types';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { MdxField } from '@/components/rich-text';

export function RichTextMain(props: GameObjectFormComponent<RichText>) {
	useSubmitOnChange(props.form, props.onSubmit);

	const { contentField, mdxField } = useFormFields(props.form, {
		contentField: ['details', 'content'],
		mdxField: ['details', 'mdx'],
	});
	contentField.set(undefined);

	return (
		<>
			<TextField field={props.form.field(['name'])} />

			<MdxField field={mdxField} />
		</>
	);
}
