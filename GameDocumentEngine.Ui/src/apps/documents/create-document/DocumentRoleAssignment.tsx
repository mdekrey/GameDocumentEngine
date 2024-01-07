import type { FieldMapping, FormFieldReturnType } from '@/utils/form';
import { useFormFields } from '@/utils/form';
import { RoleAssignmentField } from '@/components/forms/role-assignment/role-assignment-field';
import type { Atom } from 'jotai';
import { useCreateDocumentDetails } from './useCreateDocumentDetails';
import { getDocTypeTranslationNamespace } from '@/utils/api/accessors';
import { useTranslation } from 'react-i18next';

const defaultEmptyString: FieldMapping<string, string> = {
	toForm: (v) => v ?? '',
	fromForm: (v) => v ?? '',
};

export function DocumentRoleAssignment({
	documentTypeAtom,
	gameId,
	rolesField,
}: {
	documentTypeAtom: Atom<string>;
	gameId: string;
	rolesField: FormFieldReturnType<Record<string, string>>;
}) {
	const { disabled, gameDetails, docType } = useCreateDocumentDetails(
		documentTypeAtom,
		gameId,
	);
	const actualRoles = ['', ...(docType?.userRoles ?? [])];

	const { eachRole } = useFormFields(rolesField, {
		eachRole: (userId: string) => ({
			path: [userId] as const,
			translationPath: [],
			disabled,
			mapping: defaultEmptyString,
		}),
	});

	const otherPlayers = Object.fromEntries(
		Object.entries(gameDetails.players).filter(
			([playerId]) => playerId !== gameDetails.currentUserPlayerId,
		),
	);

	const translateParams: Parameters<typeof useTranslation> = docType
		? [getDocTypeTranslationNamespace(docType.key)]
		: [['create-document'], { keyPrefix: 'fields.initialRoles' }];
	const { t } = useTranslation(...translateParams);

	return (
		<RoleAssignmentField
			fields={eachRole}
			players={otherPlayers}
			roles={actualRoles}
			translation={t}
		/>
	);
}
