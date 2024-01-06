import { type CreateDocumentDetails } from '@/api/models/CreateDocumentDetails';
import { Button } from '@/components/button/button';
import { ButtonRow } from '@/components/button/button-row';
import { queries } from '@/utils/api/queries';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { useForm } from '@/utils/form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
	getDocTypeTranslationNamespace,
	getDocumentType,
} from '@/utils/api/accessors';
import { useGameType } from '@/utils/api/hooks';
import { Trans, useTranslation } from 'react-i18next';
import { TextField } from '@/components/form-fields/text-input/text-field';
import {
	NotSelected,
	SelectField,
} from '@/components/form-fields/select-input/select-field';
import { Section, SingleColumnSections } from '@/components/sections';
import { DocumentRoleAssignment } from './DocumentRoleAssignment';
import { useDocTypeFormUpdates } from './useDocTypeFormUpdates';
import { createDocumentDetailsSchema } from './createDocumentDetailsSchema';

function useCreateDocument(gameId: string) {
	return useMutation(queries.createDocument(gameId));
}

export function CreateDocument({ gameId }: { gameId: string }) {
	const navigate = useNavigate();
	const { t } = useTranslation(['create-document']);
	const form = useForm({
		defaultValue: { name: '', type: '', folderId: null, initialRoles: {} },
		schema: createDocumentDetailsSchema,
		translation: t,
		fields: {
			type: ['type'],
			allRoles: ['initialRoles'],
		},
	});
	const gameType = useGameType(gameId);
	const createDocument = useCreateDocument(gameId);
	useDocTypeFormUpdates(gameId, form);

	return (
		<SingleColumnSections>
			<Section>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<Fieldset>
						<TextField field={form.field(['name'])} />
						<SelectField
							field={form.fields.type}
							items={Object.keys(gameType.objectTypes)}
						>
							{(key) =>
								key ? (
									<Trans
										ns={getDocTypeTranslationNamespace(key)}
										i18nKey={'name'}
									/>
								) : (
									<NotSelected>
										{form.fields.type.translation('not-selected')}
									</NotSelected>
								)
							}
						</SelectField>
						<DocumentRoleAssignment
							documentTypeAtom={form.fields.type.value}
							gameId={gameId}
							rolesField={form.fields.allRoles}
						/>
						{/* TODO: create doc wizard options? */}
						<ButtonRow>
							<Button type="submit">{t('submit')}</Button>
						</ButtonRow>
					</Fieldset>
				</form>
			</Section>
		</SingleColumnSections>
	);

	async function onSubmit(
		currentValue: Omit<CreateDocumentDetails, 'details'>,
	) {
		const objectInfo = getDocumentType(gameType, currentValue.type);
		if (!objectInfo) return;
		const initialRoles = Object.fromEntries(
			Object.entries(currentValue.initialRoles).filter(([, role]) => !!role),
		);

		const document = await createDocument.mutateAsync({
			document: {
				...currentValue,
				initialRoles,
				details: objectInfo.typeInfo.template,
			},
		});
		navigate(`/game/${gameId}/document/${document.id}`);
	}
}
