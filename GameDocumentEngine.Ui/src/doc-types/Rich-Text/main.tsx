import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { RichText } from './types';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { RichTextField } from '@/components/rich-text/RichTextField';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { DisplayMdx } from '@/components/rich-text/mdx/DisplayMdx';
import { MdxField } from '@/components/rich-text/mdx/MdxField';

export function RichTextMain(props: GameObjectFormComponent<RichText>) {
	useSubmitOnChange(props.form, props.onSubmit);

	const { contentField, mdxField } = useFormFields(props.form, {
		contentField: ['details', 'content'],
		mdxField: ['details', 'mdx'],
	});

	return (
		<>
			<TextField field={props.form.field(['name'])} />
			<RichTextField field={contentField} />

			<DisplayMdx data={mdxField.value} />

			<MdxField field={mdxField} />
		</>
	);
}
