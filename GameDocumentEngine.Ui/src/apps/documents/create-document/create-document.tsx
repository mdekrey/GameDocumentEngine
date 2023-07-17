import { CreateDocumentDetails } from '@/api/models/CreateDocumentDetails';
import { Button } from '@/components/button/button';
import { ButtonRow } from '@/components/button/button-row';
import { queries } from '@/utils/api/queries';
import { NarrowContent } from '@/utils/containers/narrow-content';
import { ErrorsList } from '@/utils/form/errors/errors-list';
import { Field } from '@/utils/form/field/field';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { SelectInput } from '@/utils/form/select-input/select-input';
import { TextInput } from '@/utils/form/text-input/text-input';
import { useForm, FormOptions } from '@/utils/form/useForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ZodType, z } from 'zod';
import { useGameType } from '../useGameType';

function useCreateDocument(gameId: string) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	return useMutation(queries.createDocument(queryClient, navigate, gameId));
}

const CreateDocumentDetails = z.object({
	name: z.string().min(3),
	type: z.string().nonempty(),
}) satisfies ZodType<Omit<CreateDocumentDetails, 'details'>>;

const createDocumentForm = {
	defaultValue: { name: '', type: '' },
	schema: CreateDocumentDetails,
	fields: {
		name: ['name'],
		type: ['type'],
	},
} as const satisfies FormOptions<Omit<CreateDocumentDetails, 'details'>>;

export function CreateDocument({ gameId }: { gameId: string }) {
	const gameForm = useForm(createDocumentForm);

	const gameType = useGameType(gameId);

	const createDocument = useCreateDocument(gameId);

	return (
		<NarrowContent>
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
							{gameType.isSuccess ? (
								<SelectInput
									items={Object.keys(gameType.data.objectTypes)}
									valueSelector={(gt) => gt}
									{...gameForm.fields.type.standardProps}
								>
									{(gt) => <span className="font-bold">{gt}</span>}
								</SelectInput>
							) : null}
							<ErrorsList
								errors={gameForm.fields.type.errors}
								prefix="CreateGameDetails.type"
							/>
						</Field.Contents>
					</Field>
					<ButtonRow>
						<Button type="submit">Create</Button>
					</ButtonRow>
				</Fieldset>
			</form>
		</NarrowContent>
	);

	function onSubmit(currentValue: Omit<CreateDocumentDetails, 'details'>) {
		if (!gameType.isSuccess) return; // shouldn't have gotten here
		const objectInfo = gameType.data.objectTypes[currentValue.type];

		createDocument.mutate({
			document: { ...currentValue, details: objectInfo.typeInfo.template },
		});
	}
}
