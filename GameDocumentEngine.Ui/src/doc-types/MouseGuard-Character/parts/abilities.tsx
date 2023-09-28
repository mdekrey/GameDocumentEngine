import type { UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import type { CharacterDocument } from '../character-types';
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
		<div className="flex flex-col xl:grid xl:grid-cols-2 gap-2">
			<div className="contents xl:flex flex-col gap-2">
				<NatureAbility nature={abilities.nature} />
				<StandardAbility ability={abilities.will} padToCount={willPadding} />
				<StandardAbility ability={abilities.health} padToCount={willPadding} />
			</div>
			<div className="contents xl:flex flex-col gap-2">
				<StandardAbility
					ability={abilities.resources}
					padToCount={resourcesPadding}
				/>
				<StandardAbility
					ability={abilities.circles}
					padToCount={resourcesPadding}
				/>
			</div>
		</div>
	);
}
