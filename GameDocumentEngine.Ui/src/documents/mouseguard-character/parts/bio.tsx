import type { CharacterDocument } from '../character-types';
import type { UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { DocumentPointers } from '@/documents/get-document-pointers';

export function Bio({
	form,
	writablePointers,
}: {
	form: UseFormResult<CharacterDocument>;
	writablePointers: DocumentPointers;
}) {
	const fields = useFormFields(form, {
		name: ['name'],
		age: ['details', 'bio', 'age'],
		home: ['details', 'bio', 'home'],
		furColor: ['details', 'bio', 'furColor'],
		guardRank: ['details', 'bio', 'guardRank'],
		cloakColor: ['details', 'bio', 'cloakColor'],
		parents: ['details', 'bio', 'parents'],
		senior: ['details', 'bio', 'senior'],
		mentor: ['details', 'bio', 'mentor'],
		friend: ['details', 'bio', 'friend'],
		enemy: ['details', 'bio', 'enemy'],
	});
	const bioPointers = writablePointers.navigate('details', 'bio');
	return (
		<div className="flex flex-col md:grid md:grid-cols-2 gap-2">
			<Fieldset>
				<TextField
					field={fields.name}
					readOnly={!writablePointers.contains('name')}
				/>
				<NumberField.UndefinedOrInteger
					field={fields.age}
					readOnly={!bioPointers.contains('age')}
				/>
				<TextField.AllowUndefined
					field={fields.home}
					readOnly={!bioPointers.contains('home')}
				/>
				<TextField.AllowUndefined
					field={fields.furColor}
					readOnly={!bioPointers.contains('furColor')}
				/>
				<TextField.AllowUndefined
					field={fields.guardRank}
					readOnly={!bioPointers.contains('guardRank')}
				/>
				<TextField.AllowUndefined
					field={fields.cloakColor}
					readOnly={!bioPointers.contains('cloakColor')}
				/>
			</Fieldset>
			<Fieldset>
				<TextField.AllowUndefined
					field={fields.parents}
					readOnly={!bioPointers.contains('parents')}
				/>
				<TextField.AllowUndefined
					field={fields.mentor}
					readOnly={!bioPointers.contains('mentor')}
				/>
				<TextField.AllowUndefined
					field={fields.senior}
					readOnly={!bioPointers.contains('senior')}
				/>
				<TextField.AllowUndefined
					field={fields.friend}
					readOnly={!bioPointers.contains('friend')}
				/>
				<TextField.AllowUndefined
					field={fields.enemy}
					readOnly={!bioPointers.contains('enemy')}
				/>
			</Fieldset>
		</div>
	);
}
