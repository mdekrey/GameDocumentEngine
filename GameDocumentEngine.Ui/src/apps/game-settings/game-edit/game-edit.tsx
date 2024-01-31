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
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import type { StandardField } from '@/components/form-fields/FieldProps';
import type { TFunction } from 'i18next';

function usePatchGame(gameId: string) {
	const queryClient = useQueryClient();
	return useMutation(queries.patchGame(queryClient, gameId));
}

const GameDetailsSchema = z.object({
	name: z.string().min(3),
});

export function GameEdit({ gameId }: { gameId: string }) {
	const { t } = useTranslation(['edit-game']);
	const gameData = useGame(gameId);
	const canEdit = hasGamePermission(gameData, updateGame);
	const readOnlyAtom = useComputedAtom(() => !canEdit);
	const {
		handleSubmit,
		fields: { name },
		...gameForm
	} = useForm({
		defaultValue: { name: gameData.name },
		translation: t,
		schema: GameDetailsSchema,
		fields: {
			name: {
				path: ['name'],
				readOnly: readOnlyAtom,
			},
		},
	});

	const saveGame = usePatchGame(gameId);
	useUpdatingForm(gameForm, gameData);

	return (
		<GameEditPresentation
			nameField={name}
			canEdit={canEdit}
			t={t}
			onSubmit={handleSubmit(onSubmit)}
		/>
	);

	function onSubmit(currentValue: z.infer<typeof GameDetailsSchema>) {
		const patches = produceWithPatches(gameData, (draft) => {
			draft.name = currentValue.name;
		})[1];
		if (patches.length > 0) saveGame.mutate(patches.map(immerPatchToStandard));
	}
}

export function GameEditPresentation({
	nameField,
	canEdit,
	t,
	onSubmit,
}: {
	nameField: StandardField<string>;
	canEdit: boolean;
	t: TFunction;
	onSubmit?: React.FormEventHandler<HTMLFormElement>;
}) {
	return (
		<form onSubmit={onSubmit}>
			<Fieldset>
				<TextField field={nameField} />
				{canEdit && (
					<ButtonRow>
						<Button type="submit">{t('submit')}</Button>
					</ButtonRow>
				)}
			</Fieldset>
		</form>
	);
}
