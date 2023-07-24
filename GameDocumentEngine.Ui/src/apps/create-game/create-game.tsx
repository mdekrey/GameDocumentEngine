import { CreateGameDetails } from '@/api/models/CreateGameDetails';
import { Button } from '@/components/button/button';
import { ButtonRow } from '@/components/button/button-row';
import { queries } from '@/utils/api/queries';
import { NarrowContent } from '@/utils/containers/narrow-content';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { TextField } from '@/utils/form/text-field/text-field';
import { SelectField } from '@/utils/form/select-field/select-field';
import { useForm, FormOptions } from '@/utils/form/useForm';
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

const createGameForm = {
	defaultValue: { name: '', type: '' },
	schema: CreateGameDetails,
	fields: {
		name: ['name'],
		type: ['type'],
	},
} as const satisfies FormOptions<CreateGameDetails>;

export function CreateGame() {
	const {
		t,
		i18n: { getFixedT },
	} = useTranslation(['create-game']);
	const gameForm = useForm(createGameForm);

	const gameTypesResult = useQuery(queries.listGameTypes());
	const createGame = useCreateGame();

	return (
		<NarrowContent>
			<form onSubmit={gameForm.handleSubmit(onSubmit)}>
				<Fieldset>
					<TextField
						field={gameForm.fields.name}
						translations={getFixedT(null, 'create-game', 'fields.name')}
					/>
					<SelectField
						field={gameForm.fields.type}
						translations={getFixedT(null, 'create-game', 'fields.type')}
						items={Object.entries(gameTypesResult.data ?? {})}
						key={gameTypesResult.data ? 1 : 0}
						valueSelector={(gt) => gt[0]}
					>
						{(gt) => <span className="font-bold">{gt[1].name}</span>}
					</SelectField>
					<ButtonRow>
						<Button type="submit">{t('submit')}</Button>
					</ButtonRow>
				</Fieldset>
			</form>
		</NarrowContent>
	);

	function onSubmit(currentValue: z.infer<typeof CreateGameDetails>) {
		createGame.mutate(currentValue);
	}
}
