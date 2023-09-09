import type { UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import type { CharacterDocument } from '../character-types';
import { StandardAbility } from '../components/standard-ability';
import { NatureAbility } from '../components/nature-ability';
import { atom } from 'jotai';
import { DocumentPointers } from '@/documents/get-document-pointers';

const willPadding = atom(() => 6);
const resourcesPadding = atom(() => 10);

export function Abilities({
	form,
	writablePointers,
}: {
	form: UseFormResult<CharacterDocument>;
	writablePointers: DocumentPointers;
}) {
	const abilities = useFormFields(form, {
		nature: ['details', 'abilities', 'nature'],
		will: ['details', 'abilities', 'will'],
		health: ['details', 'abilities', 'health'],
		resources: ['details', 'abilities', 'resources'],
		circles: ['details', 'abilities', 'circles'],
	});
	const pointers = writablePointers.navigate('details', 'abilities');
	return (
		<div className="flex flex-col xl:grid xl:grid-cols-2 gap-2">
			<div className="contents xl:flex flex-col gap-2">
				<NatureAbility
					nature={abilities.nature}
					writablePointers={pointers.navigate('nature')}
				/>
				<StandardAbility
					ability={abilities.will}
					padToCount={willPadding}
					writablePointers={pointers.navigate('will')}
				/>
				<StandardAbility
					ability={abilities.health}
					padToCount={willPadding}
					writablePointers={pointers.navigate('health')}
				/>
			</div>
			<div className="contents xl:flex flex-col gap-2">
				<StandardAbility
					ability={abilities.resources}
					padToCount={resourcesPadding}
					writablePointers={pointers.navigate('resources')}
				/>
				<StandardAbility
					ability={abilities.circles}
					padToCount={resourcesPadding}
					writablePointers={pointers.navigate('circles')}
				/>
			</div>
		</div>
	);
}
