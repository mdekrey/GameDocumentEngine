import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import { useLaunchModal } from '@/utils/modal/modal-service';
import { DeleteConfirmNameModal } from '@/utils/modal/layouts/delete-confirm-name-dialog';
import { useGame } from '@/utils/api/hooks';

export function useDeleteGameWithConfirm(
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
