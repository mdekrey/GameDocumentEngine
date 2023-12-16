import { type CreateDocumentDetails } from '@/api/models/CreateDocumentDetails';
import { Button } from '@/components/button/button';
import { ButtonRow } from '@/components/button/button-row';
import { queries } from '@/utils/api/queries';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import type { FieldMapping, FormFieldReturnType } from '@/utils/form';
import { useForm, useFormFields } from '@/utils/form';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { ZodType } from 'zod';
import { z } from 'zod';
import { useGameType } from '../useGameType';
import { Trans, useTranslation } from 'react-i18next';
import { TextField } from '@/components/form-fields/text-input/text-field';
import {
	NotSelected,
	SelectField,
} from '@/components/form-fields/select-input/select-field';
import { Section, SingleColumnSections } from '@/components/sections';
import { RoleAssignmentField } from '@/components/forms/role-assignment/role-assignment-field';
import type { GameDetails } from '@/api/models/GameDetails';
import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';
import type {
	GameTypeObjectScripts,
	GameTypeScripts,
} from '@/utils/api/queries/game-types';
import { useRealtimeApi } from '@/utils/api/realtime-api';
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
	const game = useSuspenseQuery(queries.getGameDetails(gameId)).data;
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
							key={gameType ? 1 : 0}
						>
							{(key) =>
								gameType.objectTypes[key] ? (
									<Trans
										ns={gameType.objectTypes[key].translationNamespace}
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
							gameDetails={game}
							gameType={gameType}
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
		const objectInfo = gameType.objectTypes[currentValue.type];
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
	gameDetails,
	gameType,
	rolesField,
}: {
	documentTypeAtom: Atom<string>;
	gameDetails: GameDetails;
	gameType: GameTypeScripts;
	rolesField: FormFieldReturnType<Record<string, string>>;
}) {
	const realtimeApi = useRealtimeApi();
	const userQuery = useQuery(queries.getCurrentUser(realtimeApi));

	const disabled = useComputedAtom((get) => !get(documentTypeAtom));
	const documentTypeName = useAtomValue(documentTypeAtom);
	const docType = gameType.objectTypes[documentTypeName] as
		| GameTypeObjectScripts<unknown>
		| undefined;
	const actualRoles = ['', ...(docType?.userRoles ?? [])];

	const { t } = useTranslation(
		docType?.translationNamespace ?? 'document-settings',
	);

	const { eachRole } = useFormFields(rolesField, {
		eachRole: (userId: string) => ({
			path: [userId] as const,
			translationPath: [],
			disabled,
			mapping: defaultEmptyString,
		}),
	});

	const currentUserId = userQuery.data?.id;

	const otherPlayers = Object.fromEntries(
		Object.entries(gameDetails.playerNames).filter(
			([userId]) => userId !== currentUserId,
		),
	);

	// eslint-disable-next-line @typescript-eslint/unbound-method
	const setRoles = rolesField.setValue;
	useEffect(() => {
		setRoles((prev) =>
			Object.fromEntries(
				Object.entries(gameDetails.playerNames)
					.filter(([userId]) => userId !== currentUserId)
					.map(([userId]) => [
						userId,
						(docType?.userRoles.includes(prev[userId]) ? prev[userId] : '') ??
							'',
					]),
			),
		);
	}, [setRoles, docType?.userRoles, gameDetails.playerNames, currentUserId]);

	return (
		<RoleAssignmentField
			fields={eachRole}
			players={otherPlayers}
			roles={actualRoles}
			translation={t}
		/>
	);
}
