import { Button } from '@/components/button/button';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { queries } from '@/utils/api/queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { produceWithPatches } from 'immer';
import { UseFieldResult } from '@/utils/form/useField';
import { immerPatchToStandard } from '@/utils/api/immerPatchToStandard';
import { z } from 'zod';
import { ErrorsList } from '../../utils/form/errors/errors-list';
import { useForm } from '@/utils/form/useForm';
import { GameDetails } from '@/api/models/GameDetails';
import { ButtonRow } from '@/components/button/button-row';
import { NarrowContent } from '@/utils/containers/narrow-content';
import { updateFormDefault } from '@/utils/form/update-form-default';
import { useTranslation } from 'react-i18next';
import { TextField } from '@/utils/form/text-field/text-field';

function usePatchGame(gameId: string) {
	const queryClient = useQueryClient();
	return useMutation(queries.patchGame(queryClient, gameId));
}

export function GameEditFields({ name }: { name: UseFieldResult<string> }) {
	const {
		t,
		i18n: { getFixedT },
	} = useTranslation(['edit-game']);
	return (
		<Fieldset>
			<TextField
				field={name}
				translations={getFixedT(null, 'edit-game', 'fields.name')}
			/>
			<ButtonRow>
				<Button type="submit">{t('submit')}</Button>
			</ButtonRow>
		</Fieldset>
	);
}

const GameDetails = z.object({
	name: z.string().min(3),
});

export function GameEdit({ gameId }: { gameId: string }) {
	const { i18n } = useTranslation(['edit-game']);
	const gameForm = useForm({
		defaultValue: { name: '' },
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

	return (
		<NarrowContent>
			<form onSubmit={gameForm.handleSubmit(onSubmit)}>
				<GameEditFields {...gameForm.fields} />
				<ErrorsList
					errors={gameForm.errors}
					translations={i18n.getFixedT(null, 'edit-game', 'fields')}
				/>
			</form>
		</NarrowContent>
	);

	function onSubmit(currentValue: z.infer<typeof GameDetails>) {
		const patches = produceWithPatches(gameData, (draft) => {
			draft.name = currentValue.name;
		})[1];
		if (patches.length > 0) saveGame.mutate(patches.map(immerPatchToStandard));
	}
}
