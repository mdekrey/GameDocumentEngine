import { useTranslation } from 'react-i18next';
import {
	HiMiniArrowDownTray,
	HiMiniArrowUpTray,
	HiOutlineTrash,
} from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import { Button } from '@/components/button/button';
import { useLaunchModal } from '@/utils/modal/modal-service';
import { DeleteConfirmNameModal } from '@/utils/modal/layouts/delete-confirm-name-dialog';
import { IconButton } from '@/components/button/icon-button';
import { useDeleteGameUser } from './remove-game-user-modal';
import type { GameDetails } from '@/api/models/GameDetails';
import { hasGamePermission } from '@/utils/security/match-permission';
import {
	deleteGame,
	exportGame,
	importIntoGame,
	updateGameUserAccess,
} from '@/utils/security/permission-strings';
import { useCurrentUser, useGame } from '@/utils/api/hooks';
import { ConfigureImportIntoExistingGame } from '@/apps/configure-game-import/ConfigureImportIntoExistingGame';
import { launchFilePicker } from '@/components/file-picker/file-picker';

function displayRemoveUser(gameDetails: GameDetails) {
	return hasGamePermission(gameDetails, updateGameUserAccess);
}
function displayDeleteGame(gameDetails: GameDetails) {
	return hasGamePermission(gameDetails, deleteGame);
}
function displayExportGame(gameDetails: GameDetails) {
	return hasGamePermission(gameDetails, exportGame);
}
function displayImportIntoGame(gameDetails: GameDetails) {
	return hasGamePermission(gameDetails, importIntoGame);
}

export function displayDangerZone(gameDetails: GameDetails) {
	return (
		displayDeleteGame(gameDetails) ||
		displayRemoveUser(gameDetails) ||
		displayExportGame(gameDetails)
	);
}

function useDeleteGameWithConfirm(
	gameId: string,
	onSuccess: () => void | Promise<void>,
) {
	const { name } = useGame(gameId);
	const launchModal = useLaunchModal();
	const deleteGame = useMutation(queries.deleteGame);
	const { t } = useTranslation(['delete-game']);
	return async function onDeleteGame() {
		const shouldDelete = await launchModal({
			ModalContents: DeleteConfirmNameModal,
			additional: { name, translation: t },
		}).catch(() => false);
		if (shouldDelete) {
			await deleteGame.mutateAsync(gameId);
			await onSuccess();
		}
	};
}

function useImportIntoExistingGame() {
	const navigate = useNavigate();
	return useMutation(queries.importIntoExistingGame(navigate));
}

export function GameDangerZone({ gameId }: { gameId: string }) {
	const navigate = useNavigate();
	const launchModal = useLaunchModal();
	const { t } = useTranslation('game-settings');
	const gameDetails = useGame(gameId);
	const userDetails = useCurrentUser();
	const importIntoExistingGame = useImportIntoExistingGame();
	const inspectArchive = useMutation(queries.inspectGameArchive);
	const onDeleteUser = useDeleteGameUser(gameId);
	const onDeleteGame = useDeleteGameWithConfirm(gameId, () => navigate('..'));

	return (
		<>
			{displayRemoveUser(gameDetails) && (
				<ul className="list-disc ml-8">
					{Object.entries(gameDetails.players)
						.filter(([id]) => id !== userDetails.id)
						.map(([id, { name }]) => (
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
			)}
			{displayDeleteGame(gameDetails) && (
				<Button.Destructive onClick={() => void onDeleteGame()}>
					<HiOutlineTrash />
					{t('delete-game', { name: gameDetails.name })}
				</Button.Destructive>
			)}
			{displayExportGame(gameDetails) && (
				<Button.Save onClick={() => void onDownloadGame()}>
					<HiMiniArrowDownTray />
					{t('download-game', { name: gameDetails.name })}
				</Button.Save>
			)}
			{displayImportIntoGame(gameDetails) && (
				<Button.Save onClick={() => void onImportIntoGame()}>
					<HiMiniArrowUpTray />
					{t('import-into-game', { name: gameDetails.name })}
				</Button.Save>
			)}
		</>
	);

	function onDownloadGame() {
		const dl = document.createElement('a');
		dl.setAttribute('href', queries.getGameExport({ gameId }));
		dl.setAttribute('download', '');
		dl.click();
	}

	async function onImportIntoGame() {
		const files = await launchFilePicker({ accept: '.vaultvtt' });
		const file = files[0];
		const inspected = await inspectArchive.mutateAsync({ file });
		const options = await launchModal({
			ModalContents: ConfigureImportIntoExistingGame,
			additional: { inspected, gameId },
		});
		importIntoExistingGame.mutate({ gameId, file, options });
	}
}
