import { CreateGameDetails } from '@/api/models/CreateGameDetails';
import { Button } from '@/components/button/button';
import { ButtonRow } from '@/components/button/button-row';
import { queries } from '@/utils/api/queries';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { TextField } from '@/components/form-fields/text-field/text-field';
import { SelectField } from '@/components/form-fields/select-field/select-field';
import { useForm } from '@/utils/form/useForm';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ZodType, z } from 'zod';

function useCreateGame() {
	const navigate = useNavigate();
	return useMutation(queries.createGame(navigate));
}

const CreateGameDetails = z.object({
	name: z.string().nonempty(),
	type: z.string().nonempty(),
}) satisfies ZodType<CreateGameDetails>;

export function CreateGame() {
	const { t } = useTranslation(['create-game']);
	const gameForm = useForm({
		defaultValue: { name: '', type: '' },
		schema: CreateGameDetails,
		translation: t,
	});

	const gameTypesResult = useQuery(queries.listGameTypes());
	const createGame = useCreateGame();

	return (
		<>
			<form onSubmit={gameForm.handleSubmit(onSubmit)}>
				<Fieldset>
					<TextField field={gameForm.field(['name'])} />
					<SelectField
						field={gameForm.field(['type'])}
						items={Object.keys(gameTypesResult.data ?? {})}
						key={gameTypesResult.data ? 1 : 0}
					>
						{(gt) =>
							gt ? (
								<>{getGameTypeName(gt)}</>
							) : (
								<span className="text-slate-500">
									{gameForm.field(['type']).translation('not-selected')}
								</span>
							)
						}
					</SelectField>
					<ButtonRow>
						<Button type="submit">{t('submit')}</Button>
					</ButtonRow>
				</Fieldset>
			</form>
		</>
	);

	function onSubmit(currentValue: z.infer<typeof CreateGameDetails>) {
		createGame.mutate(currentValue);
	}

	function getGameTypeName(gameType: string) {
		return t('name', { ns: `game-types:${gameType}` });
	}
}
