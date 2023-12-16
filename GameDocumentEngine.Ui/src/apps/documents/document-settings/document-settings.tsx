import { useTranslation } from 'react-i18next';
import { HiOutlineTrash } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import {
	useMutation,
	useSuspenseQuery,
	useQueryClient,
} from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import { RoleAssignment } from '@/components/forms/role-assignment/role-assignment';
import { Button } from '@/components/button/button';
import { useLaunchModal } from '@/utils/modal/modal-service';
import { useDocument, useDocumentType } from '@/utils/api/hooks';
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
import type { GameObjectTypeDetails } from '@/api/models/GameObjectTypeDetails';
import type { GameTypeObjectScripts } from '@/utils/api/queries/game-types';
import type { GameDetails } from '@/api/models/GameDetails';

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
	const gameDetails = useSuspenseQuery(queries.getGameDetails(gameId)).data;
	const docData = useDocument(gameId, documentId);
	const docType = useDocumentType(gameId, documentId);

	return (
		<LoadedDocumentSettings
			gameId={gameId}
			documentId={documentId}
			gameDetails={gameDetails}
			docData={docData}
			docType={docType}
			userRoles={docData.userRoles}
			objectType={docType}
		/>
	);
}

function LoadedDocumentSettings({
	gameId,
	documentId,
	gameDetails,
	docData,
	docType,
	userRoles,
	objectType,
}: {
	gameId: string;
	documentId: string;
	gameDetails: GameDetails;
	docData: DocumentDetails;
	docType: GameObjectTypeDetails;
	userRoles: Record<string, string>;
	objectType: GameTypeObjectScripts<unknown>;
}) {
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
					userRoles={userRoles}
					playerNames={gameDetails.playerNames}
					defaultRole=""
					roles={['', ...docType.userRoles]}
					onSaveRoles={onSaveRoles}
					translations={t}
					roleTranslationsNamespace={objectType.translationNamespace}
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
				.filter(([key, newValue]) => newValue !== (userRoles[key] ?? null)),
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
