import type { GameImportArchiveSummary } from '@vaultvtt/api/openapi/models/GameImportArchiveSummary';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import type { ImportPlayerFormOptions } from './mappings';
import { useFieldList } from '@/doc-types/Break-Character/parts/useFieldList';
import { CheckboxField } from '@/components/form-fields/checkbox-input/checkbox-field';
import { Prose } from '@/components/text/common';

export function SelectPlayers({
	field,
	players,
}: {
	field: FormFieldReturnType<ImportPlayerFormOptions[]>;
	players: GameImportArchiveSummary['players'];
}) {
	const defaultOption: ImportPlayerFormOptions = {
		id: '',
		selected: false,
	};
	const { length, item, key } = useFieldList(field, defaultOption, (v) => v.id);
	return (
		<>
			{Array(length)
				.fill(0)
				.map((_, index) => (
					<ConfigurePlayerOptions
						key={key(index)}
						field={item(index)}
						player={players[index]}
					/>
				))}
		</>
	);
}

function ConfigurePlayerOptions({
	field,
	player,
}: {
	field: FormFieldReturnType<ImportPlayerFormOptions>;
	player: GameImportArchiveSummary['players'][number];
}) {
	const { selected } = useFormFields(field, {
		selected: ['selected'],
	});
	return (
		<div>
			<Prose>{player.name}</Prose>
			<CheckboxField field={selected} />
		</div>
	);
}
