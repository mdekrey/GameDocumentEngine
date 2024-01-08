import { Button } from '@/components/button/button';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { queries } from '@/utils/api/queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { produceWithPatches } from 'immer';
import { immerPatchToStandard } from '@/utils/api/immerPatchToStandard';
import { z } from 'zod';
import { useForm, useUpdatingForm } from '@/utils/form';
import { ButtonRow } from '@/components/button/button-row';
import { useTranslation } from 'react-i18next';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { hasGamePermission } from '@/utils/security/match-permission';
import { updateGame } from '@/utils/security/permission-strings';
import { useGame } from '@/utils/api/hooks';

function usePatchGame(gameId: string) {
	const queryClient = useQueryClient();
	return useMutation(queries.patchGame(queryClient, gameId));
}

const GameDetailsSchema = z.object({
	name: z.string().min(3),
});

export function GameEdit({ gameId }: { gameId: string }) {
	const { t } = useTranslation(['edit-game']);
	const gameForm = useForm({
		defaultValue: { name: '' },
		translation: t,
		schema: GameDetailsSchema,
		fields: {
			name: ['name'],
		},
	});

	const gameData = useGame(gameId);
	const saveGame = usePatchGame(gameId);
	useUpdatingForm(gameForm, gameData);
	const canEdit = hasGamePermission(gameData, updateGame);
	gameForm.store.set(gameForm.readOnlyFields, !canEdit);

	return (
		<>
			<form onSubmit={gameForm.handleSubmit(onSubmit)}>
				<Fieldset>
					<TextField field={gameForm.fields.name} />
					{canEdit && (
						<ButtonRow>
							<Button type="submit">{t('submit')}</Button>
						</ButtonRow>
					)}
				</Fieldset>
			</form>
		</>
	);

	function onSubmit(currentValue: z.infer<typeof GameDetailsSchema>) {
		const patches = produceWithPatches(gameData, (draft) => {
			draft.name = currentValue.name;
		})[1];
		if (patches.length > 0) saveGame.mutate(patches.map(immerPatchToStandard));
	}
}
