import { CreateGameDetails } from '@/api/models/CreateGameDetails';
import { Button } from '@/components/button/button';
import { api, gameTypesQuery } from '@/utils/api';
import { ErrorsList } from '@/utils/form/errors/errors-list';
import { Field } from '@/utils/form/field/field';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { SelectInput } from '@/utils/form/select-input/select-input';
import { TextInput } from '@/utils/form/text-input/text-input';
import { useForm, FormOptions } from '@/utils/form/useForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ZodType, z } from 'zod';

function useCreateGame() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (game: CreateGameDetails) => {
			const response = await api.createGame({ body: game });
			if (response.statusCode === 200) return response;
			else throw new Error('Could not save changes');
		},
		onSuccess: () => {
			queryClient;
			// TODO: invalidate game list
			// queryClient.invalidateQueries();
			// TODO: redirect to game landing page
		},
	});
}

const CreateGameDetails = z.object({
	name: z.string().min(3),
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

export function CreateGameForm() {
	const gameForm = useForm(createGameForm);

	const gameTypesResult = useQuery(gameTypesQuery());
	const createGame = useCreateGame();

	return (
		<form onSubmit={gameForm.handleSubmit(onSubmit)}>
			<Fieldset>
				<Field>
					<Field.Label>Name</Field.Label>
					<Field.Contents>
						<TextInput {...gameForm.fields.name.standardProps} />
						<ErrorsList
							errors={gameForm.fields.name.errors}
							prefix="CreateGameDetails.name"
						/>
					</Field.Contents>
				</Field>
				<Field>
					<Field.Label>Type</Field.Label>
					<Field.Contents>
						{gameTypesResult.isSuccess ? (
							<SelectInput
								items={gameTypesResult.data}
								valueSelector={(gt) => gt.name}
								{...gameForm.fields.type.standardProps}
							>
								{(gt) => <span className="font-bold">{gt.name}</span>}
							</SelectInput>
						) : // TODO: loading spinner
						null}
						<ErrorsList
							errors={gameForm.fields.type.errors}
							prefix="CreateGameDetails.type"
						/>
					</Field.Contents>
				</Field>
				<div className="col-span-2 flex flex-row-reverse gap-2">
					<Button type="submit">Create Game</Button>
				</div>
			</Fieldset>
		</form>
	);

	function onSubmit(currentValue: z.infer<typeof CreateGameDetails>) {
		createGame.mutate(currentValue);
	}
}
