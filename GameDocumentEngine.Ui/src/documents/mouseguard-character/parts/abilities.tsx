import { UseFormResult, useFormFields } from '@/utils/form/useForm';
import { CharacterDocument } from '../character-types';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { StandardAbility } from '../components/standard-ability';
import { NatureAbility } from '../components/nature-ability';

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
				<StandardAbility ability={abilities.will} padToCount={6} />
				<StandardAbility ability={abilities.health} padToCount={6} />
			</Fieldset>
			<Fieldset>
				<StandardAbility ability={abilities.resources} padToCount={10} />
				<StandardAbility ability={abilities.circles} padToCount={10} />
			</Fieldset>
		</>
	);
}
