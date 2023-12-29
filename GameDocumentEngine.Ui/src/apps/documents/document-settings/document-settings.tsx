import { useTranslation } from 'react-i18next';
import { HiOutlineTrash } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import { RoleAssignment } from '@/components/forms/role-assignment/role-assignment';
import { Button } from '@/components/button/button';
import { useLaunchModal } from '@/utils/modal/modal-service';
import { useDocument, useDocumentType, useGame } from '@/utils/api/hooks';
import { DeleteDocumentModal } from '../document-settings/delete-document-modal';
import { Prose } from '@/components/text/common';
import {
	deleteDocument,
	updateDocumentAccessForSelf,
	updateDocumentUserAccess,
} from '@/utils/security/permission-strings';
import { hasDocumentPermission } from '@/utils/security/match-permission';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import { Section, SingleColumnSections } from '@/components/sections';
import { DocumentEdit } from './document-edit/document-edit';
import { getDocTypeTranslationNamespace } from '@/utils/api/accessors';

function displayUserPermissions(documentDetails: DocumentDetails) {
	return hasDocumentPermission(documentDetails, updateDocumentUserAccess);
}
function canUpdateOwnPermissions(documentDetails: DocumentDetails) {
	return hasDocumentPermission(documentDetails, updateDocumentAccessForSelf);
}

function displayDeleteDocument(documentDetails: DocumentDetails) {
	return hasDocumentPermission(documentDetails, deleteDocument);
}

export function displayDocumentSettings(documentDetails: DocumentDetails) {
	return (
		displayUserPermissions(documentDetails) ||
		displayDeleteDocument(documentDetails)
	);
}

function useUpdateDocumentRoleAssignments(gameId: string, documentId: string) {
	return useMutation(queries.updateDocumentRoleAssignments(gameId, documentId));
}

const SectionHeader = Prose.extend('SectionHeader', () => (
	<h2 className="text-xl font-bold my-4" />
));

export function DocumentSettings({
	gameId,
	documentId,
}: {
	gameId: string;
	documentId: string;
}) {
	const gameDetails = useGame(gameId);
	const docData = useDocument(gameId, documentId);
	const docType = useDocumentType(gameId, documentId);
	const { t } = useTranslation('document-settings');
	const displayDelete = displayDeleteDocument(docData);
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const launchModal = useLaunchModal();
	const deleteDocument = useMutation(
		queries.deleteDocument(queryClient, gameId, documentId),
	);
	const updateDocumentRoleAssignments = useUpdateDocumentRoleAssignments(
		gameId,
		documentId,
	);
	const { userRoles = [], key } = docType ?? {};

	return (
		<SingleColumnSections>
			<Section>
				<SectionHeader>{t('configure-details')}</SectionHeader>
				<DocumentEdit gameId={gameId} documentId={documentId} />
			</Section>
			<Section>
				<SectionHeader>
					{t('configure-roles', { name: docData.name })}
				</SectionHeader>
				<RoleAssignment
					userRoles={docData.userRoles}
					playerNames={gameDetails.playerNames}
					defaultRole=""
					roles={['', ...userRoles]}
					onSaveRoles={onSaveRoles}
					translations={t}
					roleTranslationsNamespace={getDocTypeTranslationNamespace(key)}
					allowUpdate={displayUserPermissions(docData)}
					allowUpdateSelf={canUpdateOwnPermissions(docData)}
				/>
			</Section>
			{displayDelete && (
				<Section className="flex flex-col gap-2">
					<SectionHeader>{t('danger-zone')}</SectionHeader>
					<Button.Destructive onClick={() => void handleDelete()}>
						<HiOutlineTrash />
						{t('delete-document', { name: docData.name })}
					</Button.Destructive>
				</Section>
			)}
		</SingleColumnSections>
	);

	function onSaveRoles(roleAssignments: { [userId: string]: string }) {
		const changed = Object.fromEntries(
			Object.entries(roleAssignments)
				.map(
					([key, newValue]) =>
						[key, newValue === '' ? null : newValue] as const,
				)
				.filter(
					([key, newValue]) => newValue !== (docData.userRoles[key] ?? null),
				),
		);
		updateDocumentRoleAssignments.mutate(changed);
	}

	async function handleDelete() {
		const shouldDelete = await launchModal({
			ModalContents: DeleteDocumentModal,
			additional: { name: docData.name },
		}).catch(() => false);
		if (shouldDelete) {
			deleteDocument.mutate();
			navigate(`/game/${gameId}`);
		}
	}
}
