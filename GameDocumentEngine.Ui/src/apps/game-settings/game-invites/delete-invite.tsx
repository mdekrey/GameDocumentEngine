import type { GameInvite } from '@vaultvtt/api/openapi/models/GameInvite';
import { queries } from '@/utils/api/queries';
import { useAreYouSure } from '@/utils/modal/layouts/are-you-sure-dialog';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { getInviteUrl } from './getInviteUrl';
import { elementTemplate } from '@/components/template';

const UrlDisplay = elementTemplate('UrlDisplay', 'span', (T) => (
	<T className="font-mono text-blue-700 dark:text-blue-300" />
));

function DeleteInviteTarget({ invite }: { invite: GameInvite }) {
	return <UrlDisplay>{getInviteUrl(invite)}</UrlDisplay>;
}

export function useDeleteInvite(gameId: string) {
	const queryClient = useQueryClient();
	const deleteInvite = useMutation(
		queries.cancelInvitation(queryClient, gameId),
	);
	const areYouSure = useAreYouSure(['delete-invite'], DeleteInviteTarget);
	return async function showDeleteInviteModal(invite: GameInvite) {
		const result = await areYouSure({ invite }).catch(() => false);
		if (result) {
			deleteInvite.mutate({ invite: invite.id });
		}
	};
}
