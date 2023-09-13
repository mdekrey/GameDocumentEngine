import { Button } from '@/components/button/button';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { queries } from '@/utils/api/queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { produceWithPatches } from 'immer';
import type { UseFieldResult } from '@/utils/form/useField';
import { immerPatchToStandard } from '@/utils/api/immerPatchToStandard';
import { z } from 'zod';
import { useForm } from '@/utils/form/useForm';
import type { GameDetails } from '@/api/models/GameDetails';
import { ButtonRow } from '@/components/button/button-row';
import { updateFormDefault } from '@/utils/form/update-form-default';
import { useTranslation } from 'react-i18next';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { hasGamePermission } from '@/utils/security/match-permission';
import { updateGame } from '@/utils/security/permission-strings';

function usePatchGame(gameId: string) {
	const queryClient = useQueryClient();
	return useMutation(queries.patchGame(queryClient, gameId));
}

export function GameEditFields({
	name,
	canEdit,
}: {
	name: UseFieldResult<string>;
	canEdit: boolean;
}) {
	const { t } = useTranslation(['edit-game']);
	return (
		<Fieldset>
			<TextField field={name} />
			{canEdit && (
				<ButtonRow>
					<Button type="submit">{t('submit')}</Button>
				</ButtonRow>
			)}
		</Fieldset>
	);
}

const GameDetails = z.object({
	name: z.string().min(3),
});

export function GameEdit({ gameId }: { gameId: string }) {
	const { t } = useTranslation(['edit-game']);
	const gameForm = useForm({
		defaultValue: { name: '' },
		translation: t,
		schema: GameDetails,
		fields: {
			name: ['name'],
		},
	});

	const gameQueryResult = useQuery(queries.getGameDetails(gameId));
	const saveGame = usePatchGame(gameId);

	if (!gameQueryResult.isSuccess) {
		if (gameQueryResult.isLoadingError) {
			return 'Failed to load';
		}
		return 'Loading';
	}
	const gameData = gameQueryResult.data;
	updateFormDefault(gameForm, gameData);
	const canEdit = hasGamePermission(gameData, updateGame);
	gameForm.store.set(gameForm.readOnlyFields, !canEdit);

	return (
		<>
			<form onSubmit={gameForm.handleSubmit(onSubmit)}>
				<GameEditFields {...gameForm.fields} canEdit={canEdit} />
			</form>
		</>
	);

	function onSubmit(currentValue: z.infer<typeof GameDetails>) {
		const patches = produceWithPatches(gameData, (draft) => {
			draft.name = currentValue.name;
		})[1];
		if (patches.length > 0) saveGame.mutate(patches.map(immerPatchToStandard));
	}
}
