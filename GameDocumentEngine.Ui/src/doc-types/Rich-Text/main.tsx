import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { RichText } from './types';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { RichTextField } from '@/components/rich-text/RichTextField';
import { Section, SingleColumnSections } from '@/components/sections';
import { useFormFields } from '@principlestudios/react-jotai-forms';

export function RichTextMain(props: GameObjectFormComponent<RichText>) {
	useSubmitOnChange(props.form, props.onSubmit);

	const { contentField } = useFormFields(props.form, {
		contentField: ['details', 'content'],
	});

	return (
		<>
			<SingleColumnSections>
				<Section>
					<Fieldset>
						<TextField field={props.form.field(['name'])} />
						<RichTextField field={contentField} />
					</Fieldset>
				</Section>
			</SingleColumnSections>
		</>
	);
}
