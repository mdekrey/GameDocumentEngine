import { type CreateDocumentDetails } from '@/api/models/CreateDocumentDetails';
import { Button } from '@/components/button/button';
import { ButtonRow } from '@/components/button/button-row';
import { queries } from '@/utils/api/queries';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import type { FieldMapping, FormFieldReturnType } from '@/utils/form';
import { useForm, useFormFields } from '@/utils/form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { ZodType } from 'zod';
import { z } from 'zod';
import {
	getDocTypeTranslationNamespace,
	getDocumentType,
} from '@/utils/api/accessors';
import {
	useCurrentUser,
	useDocTypeTranslation,
	useGame,
	useGameType,
} from '@/utils/api/hooks';
import { Trans, useTranslation } from 'react-i18next';
import { TextField } from '@/components/form-fields/text-input/text-field';
import {
	NotSelected,
	SelectField,
} from '@/components/form-fields/select-input/select-field';
import { Section, SingleColumnSections } from '@/components/sections';
import { RoleAssignmentField } from '@/components/forms/role-assignment/role-assignment-field';
import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { useEffect } from 'react';

function useCreateDocument(gameId: string) {
	return useMutation(queries.createDocument(gameId));
}

const CreateDocumentDetails = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	folderId: z.string().nullable(),
	initialRoles: z.record(z.string()),
}) satisfies ZodType<Omit<CreateDocumentDetails, 'details'>>;

export function CreateDocument({ gameId }: { gameId: string }) {
	const navigate = useNavigate();
	const { t } = useTranslation(['create-document']);
	const form = useForm({
		defaultValue: { name: '', type: '', folderId: null, initialRoles: {} },
		schema: CreateDocumentDetails,
		translation: t,
		fields: {
			type: ['type'],
			allRoles: ['initialRoles'],
		},
	});
	const gameType = useGameType(gameId);
	const createDocument = useCreateDocument(gameId);

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

const defaultEmptyString: FieldMapping<string, string> = {
	toForm: (v) => v ?? '',
	fromForm: (v) => v ?? '',
};

function DocumentRoleAssignment({
	documentTypeAtom,
	gameId,
	rolesField,
}: {
	documentTypeAtom: Atom<string>;
	gameId: string;
	rolesField: FormFieldReturnType<Record<string, string>>;
}) {
	const user = useCurrentUser();

	const disabled = useComputedAtom((get) => !get(documentTypeAtom));
	const documentTypeName = useAtomValue(documentTypeAtom);
	const gameDetails = useGame(gameId);
	const gameType = useGameType(gameId);
	const docType = getDocumentType(gameType, documentTypeName);
	const actualRoles = ['', ...(docType?.userRoles ?? [])];
	const t = useDocTypeTranslation(documentTypeName);

	const { eachRole } = useFormFields(rolesField, {
		eachRole: (userId: string) => ({
			path: [userId] as const,
			translationPath: [],
			disabled,
			mapping: defaultEmptyString,
		}),
	});

	const currentUserId = user.id;

	const otherPlayers = Object.fromEntries(
		Object.entries(gameDetails.players).filter(
			([playerId]) => playerId !== gameDetails.currentUserPlayerId,
		),
	);

	const setRoles = rolesField.setValue;
	useEffect(() => {
		setRoles((prev) =>
			Object.fromEntries(
				Object.entries(gameDetails.players)
					.filter(([playerId]) => playerId !== gameDetails.currentUserPlayerId)
					.map(([playerId]) => [
						playerId,
						(docType?.userRoles.includes(prev[playerId])
							? prev[playerId]
							: '') ?? '',
					]),
			),
		);
	}, [
		setRoles,
		docType?.userRoles,
		gameDetails.players,
		gameDetails.currentUserPlayerId,
		currentUserId,
	]);

	return (
		<RoleAssignmentField
			fields={eachRole}
			players={otherPlayers}
			roles={actualRoles}
			translation={docType ? t : rolesField.translation}
		/>
	);
}
