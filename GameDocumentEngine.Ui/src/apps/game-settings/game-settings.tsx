import { useTranslation } from 'react-i18next';
import { HiOutlineTrash } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import { Button } from '@/components/button/button';
import { useModal } from '@/utils/modal/modal-service';
import { Prose } from '@/components/text/common';
import { GameRoles } from './game-roles/game-roles';
import { DeleteGameModal } from './delete-game-modal';
import { GameInvites } from './game-invites/game-invites';
import { GameEdit } from './game-edit/game-edit';
import { elementTemplate } from '@/components/template';
import { IconButton } from '@/components/button/icon-button';
import { RemoveGameUserModal } from './remove-game-user-modal';

function useDeleteGame() {
	return useMutation(queries.deleteGame);
}

function useRemoveUserFromGame() {
	return useMutation(queries.removeUserFromGame);
}

function Sections({ children }: { children?: React.ReactNode }) {
	return (
		<div className="flex flex-col max-w-sm m-auto divide-y">{children}</div>
	);
}

const Section = elementTemplate<'section'>(
	'Section',
	<section className="py-4" />,
);

const SectionHeader = Prose.extend(
	'SectionHeader',
	<h2 className="text-xl font-bold mb-4" />,
	{ overrideType: true },
);

export function GameSettings({ gameId }: { gameId: string }) {
	const navigate = useNavigate();
	const launchModal = useModal();
	const { t } = useTranslation('game-settings');
	const gameResult = useQuery(queries.getGameDetails(gameId));
	const deleteGame = useDeleteGame();
	const removeUser = useRemoveUserFromGame();

	if (gameResult.isLoading) {
		return 'Loading';
	}
	if (!gameResult.isSuccess) {
		return 'An error occurred loading the game.';
	}

	const gameDetails = gameResult.data;

	return (
		<Sections>
			<Section>
				<SectionHeader>{t('configure-details')}</SectionHeader>
				<GameEdit gameId={gameId} />
			</Section>
			<Section>
				<SectionHeader>{t('configure-roles')}</SectionHeader>
				<GameRoles gameId={gameId} />
			</Section>
			<Section>
				<SectionHeader>{t('configure-invites')}</SectionHeader>
				<GameInvites gameId={gameId} />
			</Section>
			<Section className="flex flex-col gap-2">
				<SectionHeader>{t('danger-zone')}</SectionHeader>
				<ul className="list-disc ml-8">
					{Object.entries(gameDetails.playerNames).map(([id, name]) => (
						<li key={id} className="flex flex-row gap-3 my-3 items-center">
							{name}
							<IconButton.Destructive
								onClick={() => void onDeleteUser(id, name)}
								title={t('delete-user', { name })}
							>
								<HiOutlineTrash />
							</IconButton.Destructive>
						</li>
					))}
				</ul>
				<Button.Destructive onClick={() => void onDeleteGame()}>
					<HiOutlineTrash />
					{t('delete-game', { name: gameDetails.name })}
				</Button.Destructive>
			</Section>
		</Sections>
	);

	async function onDeleteUser(userId: string, name: string) {
		const shouldDelete = await launchModal({
			ModalContents: RemoveGameUserModal,
			additional: { name },
		}).catch(() => false);
		if (shouldDelete) {
			removeUser.mutate({ gameId, userId });
		}
	}

	async function onDeleteGame() {
		const shouldDelete = await launchModal({
			ModalContents: DeleteGameModal,
			additional: { name: gameDetails.name },
		}).catch(() => false);
		if (shouldDelete) {
			deleteGame.mutate(gameId);
			navigate('..');
		}
	}
}
