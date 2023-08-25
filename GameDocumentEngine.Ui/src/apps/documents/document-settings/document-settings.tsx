import { useTranslation } from 'react-i18next';
import { HiOutlineTrash } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import { RoleAssignment } from '@/components/forms/role-assignment/role-assignment';
import { Button } from '@/components/button/button';
import { useModal } from '@/utils/modal/modal-service';
import { useGameType } from '../useGameType';
import { DeleteDocumentModal } from '../document-settings/delete-document-modal';
import { Prose } from '@/components/text/common';

function useUpdateDocumentRoleAssignments(gameId: string, documentId: string) {
	return useMutation(queries.updateDocumentRoleAssignments(gameId, documentId));
}

function Sections({ children }: { children?: React.ReactNode }) {
	return (
		<div className="flex flex-col max-w-sm m-auto divide-y gap-4">
			{children}
		</div>
	);
}

const SectionHeader = Prose.extend(
	'SectionHeader',
	<p className="text-xl font-bold my-4" />,
);

export function DocumentSettings({
	gameId,
	documentId,
}: {
	gameId: string;
	documentId: string;
}) {
	const navigate = useNavigate();
	const launchModal = useModal();
	const { t } = useTranslation('document-settings');
	const gameResult = useQuery(queries.getGameDetails(gameId));
	const documentResult = useQuery(queries.getDocument(gameId, documentId));
	const queryClient = useQueryClient();
	const deleteDocument = useMutation(
		queries.deleteDocument(queryClient, gameId, documentId),
	);
	const updateDocumentRoleAssignments = useUpdateDocumentRoleAssignments(
		gameId,
		documentId,
	);
	const gameType = useGameType(gameId);

	if (gameResult.isLoading || documentResult.isLoading || gameType.isLoading) {
		return 'Loading';
	}
	if (
		!gameResult.isSuccess ||
		!documentResult.isSuccess ||
		!gameType.isSuccess
	) {
		return 'An error occurred loading the game.';
	}

	const docData = documentResult.data;
	const gameDetails = gameResult.data;
	const docType = gameDetails.typeInfo.objectTypes.find(
		(t) => t.key == documentResult.data.type,
	);
	if (!docType) {
		return 'Unknown document type';
	}
	const actualRoles = ['', ...docType.userRoles];
	const permissions = documentResult.data.permissions;

	return (
		<Sections>
			<section>
				<SectionHeader>
					{t('configure-roles', { name: docData.name })}
				</SectionHeader>
				<RoleAssignment
					permissions={permissions}
					playerNames={gameDetails.playerNames}
					defaultRole=""
					roles={actualRoles}
					onSaveRoles={onSaveRoles}
					translations={t}
					roleTranslations={
						gameType.data.objectTypes[documentResult.data.type].translation
					}
				/>
			</section>
			<section className="flex flex-col gap-2">
				<SectionHeader>{t('danger-zone')}</SectionHeader>
				<Button.Destructive onClick={() => void handleDelete()}>
					<HiOutlineTrash />
					{t('delete-document', { name: docData.name })}
				</Button.Destructive>
			</section>
		</Sections>
	);

	function onSaveRoles(roleAssignments: { [userId: string]: string }) {
		const changed = Object.fromEntries(
			Object.entries(roleAssignments)
				.map(
					([key, newValue]) =>
						[key, newValue === '' ? null : newValue] as const,
				)
				.filter(([key, newValue]) => newValue !== (permissions[key] ?? null)),
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
