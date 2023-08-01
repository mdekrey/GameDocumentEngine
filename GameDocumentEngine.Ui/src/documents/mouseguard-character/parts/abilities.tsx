import { UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { CharacterDocument } from '../character-types';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { StandardAbility } from '../components/standard-ability';
import { NatureAbility } from '../components/nature-ability';
import { atom } from 'jotai';

const willPadding = atom(() => 6);
const resourcesPadding = atom(() => 10);

export function Abilities({
	form,
}: {
	form: UseFormResult<CharacterDocument>;
}) {
	const abilities = useFormFields(form, {
		nature: ['details', 'abilities', 'nature'],
		will: ['details', 'abilities', 'will'],
		health: ['details', 'abilities', 'health'],
		resources: ['details', 'abilities', 'resources'],
		circles: ['details', 'abilities', 'circles'],
	});
	return (
		<>
			<Fieldset>
				<NatureAbility nature={abilities.nature} />
				<StandardAbility ability={abilities.will} padToCount={willPadding} />
				<StandardAbility ability={abilities.health} padToCount={willPadding} />
			</Fieldset>
			<Fieldset>
				<StandardAbility
					ability={abilities.resources}
					padToCount={resourcesPadding}
				/>
				<StandardAbility
					ability={abilities.circles}
					padToCount={resourcesPadding}
				/>
			</Fieldset>
		</>
	);
}
