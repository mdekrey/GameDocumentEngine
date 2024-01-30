import type { GameInvite } from '@/api/models/GameInvite';
import { queries } from '@/utils/api/queries';
import { useAreYouSure } from '@/utils/modal/layouts/are-you-sure-dialog';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { getInviteUrl } from './getInviteUrl';

export function useDeleteInvite(gameId: string) {
	const queryClient = useQueryClient();
	const deleteInvite = useMutation(
		queries.cancelInvitation(queryClient, gameId),
	);
	const areYouSure = useAreYouSure(['delete-invite']);
	return async function showDeleteInviteModal(invite: GameInvite) {
		const Target = () => (
			<span className="font-mono text-blue-950 dark:text-blue-50">
				{getInviteUrl(invite)}
			</span>
		);
		const result = await areYouSure(() => ({
			components: { Target: <Target /> },
		})).catch(() => false);
		if (result) {
			deleteInvite.mutate({ invite: invite.id });
		}
	};
}
