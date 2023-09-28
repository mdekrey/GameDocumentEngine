import { useFormFields } from '@/utils/form/useFormFields';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import type { Folder } from './types';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { Section, SingleColumnSections } from '@/components/sections';

export function Sheet({ form, onSubmit }: GameObjectFormComponent<Folder>) {
	useSubmitOnChange(form, onSubmit);
	const fields = useFormFields(form, {
		name: ['name'],
	});

	return (
		<SingleColumnSections>
			<Section>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-2"
				>
					<TextField field={fields.name} />
				</form>
			</Section>
		</SingleColumnSections>
	);
}
