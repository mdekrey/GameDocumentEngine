import { CreateDocumentDetails } from '@/api/models/CreateDocumentDetails';
import { Button } from '@/components/button/button';
import { ButtonRow } from '@/components/button/button-row';
import { queries } from '@/utils/api/queries';
import { NarrowContent } from '@/utils/containers/narrow-content';
import { Fieldset } from '@/utils/form-fields/fieldset/fieldset';
import { useForm } from '@/utils/form/useForm';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ZodType, z } from 'zod';
import { useGameType } from '../useGameType';
import { useTranslation } from 'react-i18next';
import { TextField } from '@/utils/form-fields/text-field/text-field';
import { SelectField } from '@/utils/form-fields/select-field/select-field';

function useCreateDocument(gameId: string) {
	const navigate = useNavigate();
	return useMutation(queries.createDocument(navigate, gameId));
}

const CreateDocumentDetails = z.object({
	name: z.string().min(3),
	type: z.string().nonempty(),
}) satisfies ZodType<Omit<CreateDocumentDetails, 'details'>>;

export function CreateDocument({ gameId }: { gameId: string }) {
	const { t } = useTranslation(['create-document']);
	const gameForm = useForm({
		defaultValue: { name: '', type: '' },
		schema: CreateDocumentDetails,
		translation: t,
	});

	const gameType = useGameType(gameId);

	const createDocument = useCreateDocument(gameId);

	return (
		<NarrowContent>
			<form onSubmit={gameForm.handleSubmit(onSubmit)}>
				<Fieldset>
					<TextField field={gameForm.field(['name'])} />
					<SelectField
						field={gameForm.field(['type'])}
						items={
							gameType.isSuccess
								? Object.entries(gameType.data.objectTypes)
								: []
						}
						key={gameType.data ? 1 : 0}
						valueSelector={([dt]) => dt}
					>
						{([, { translation: t }]) => t('name')}
					</SelectField>
					<ButtonRow>
						<Button type="submit">{t('submit')}</Button>
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
