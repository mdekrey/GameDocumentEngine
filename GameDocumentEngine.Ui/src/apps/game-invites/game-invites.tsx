import { IconButton } from '@/components/button/icon-button';
import { queries } from '@/utils/api/queries';
import { useModal } from '@/utils/modal/modal-service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HiPlus, HiLink, HiOutlineTrash, HiXMark } from 'react-icons/hi2';
import { CreateInvite } from './create-invite';
import { formatDistanceToNow } from 'date-fns';
import { GameInvite } from '@/api/models/GameInvite';
import { constructUrl as constructClaimInvitation } from '@/api/operations/claimInvitation';
import { DeleteInviteModal } from './delete-invite';
import { useTranslation } from 'react-i18next';
import { useGameType } from '../documents/useGameType';

export function GameInvites({ gameId }: { gameId: string }) {
	const { t } = useTranslation(['list-invites']);

	const gameData = useQuery(queries.getGameDetails(gameId));
	const invitationsResult = useQuery(queries.listInvitations(gameId));
	const launchModal = useModal();
	const copyLink = useMutation({
		mutationFn: async (invitation: GameInvite) => {
			await navigator.clipboard.writeText(getInviteUrl(invitation));
		},
	});
	const queryClient = useQueryClient();
	const deleteInvite = useMutation(
		queries.cancelInvitation(queryClient, gameId),
	);
	const gameTypeInfo = useGameType(gameId);

	if (
		invitationsResult.isLoading ||
		gameData.isLoading ||
		gameTypeInfo.isLoading
	) {
		return 'Loading';
	}
	if (
		!invitationsResult.isSuccess ||
		!gameData.isSuccess ||
		!gameTypeInfo.isSuccess
	) {
		return 'An error occurred loading invitations.';
	}

	const gameDetails = gameData.data;
	const invitations = Object.values(invitationsResult.data);
	const gameType = gameTypeInfo.data;

	return (
		<>
			<div className="flex flex-row gap-3">
				<h1 className="text-2xl font-bold flex-1">{t('title')}</h1>

				<IconButton.Save title={t('create-new')} onClick={createInvite}>
					<HiPlus />
				</IconButton.Save>
			</div>
			<table className="gap-3 items-center justify-items-center w-full">
				<tr>
					<th className="text-left">{t('table.role')}</th>
					<th>{t('table.uses')}</th>
					<th>{t('table.expires')}</th>
					<th className="sr-only">{/* Actions */}</th>
				</tr>
				{invitations.length ? (
					invitations.map((invite) => (
						<tr key={invite.id}>
							{copyLink.isSuccess && copyLink.variables?.id === invite.id ? (
								<td colSpan={4}>
									<div className="bg-green-200 border-green-400 rounded-full text-green-800 text-center p-1 pl-3 flex gap-3 justify-between items-center">
										{t('copied-to-clipboard')}
										<IconButton.Save
											title={t('cancel-copied-notice')}
											onClick={() => copyLink.reset()}
										>
											<HiXMark />
										</IconButton.Save>
									</div>
								</td>
							) : (
								<>
									<td>{gameType.translation(`roles.${invite.role}.name`)}</td>
									<td className="text-center">
										{invite.usesRemaining === -1
											? t('unlimited-uses-remaining')
											: invite.usesRemaining}
									</td>
									<td className="text-center">
										{t('expires-in', {
											timeDistance: formatDistanceToNow(
												Date.parse(invite.expiration),
											),
										})}
									</td>
									<td className="justify-self-end flex flex-row-reverse gap-3 p-1">
										<IconButton
											title={t('copy')}
											onClick={() => copyLink.mutate(invite)}
										>
											<HiLink />
										</IconButton>
										<IconButton.Destructive
											title={t('delete')}
											onClick={() => void showDeleteInviteModal(invite)}
										>
											<HiOutlineTrash />
										</IconButton.Destructive>
									</td>
								</>
							)}
						</tr>
					))
				) : (
					<tr>
						<td>{t('none')}</td>
					</tr>
				)}
			</table>
		</>
	);

	function createInvite() {
		void launchModal({
			additional: {
				gameId,
				gameData: gameDetails,
				gameType,
			},
			ModalContents: CreateInvite,
		});
	}

	async function showDeleteInviteModal(invite: GameInvite) {
		const result = await launchModal({
			additional: { url: getInviteUrl(invite) },
			ModalContents: DeleteInviteModal,
		});
		if (result) {
			deleteInvite.mutate({ invite: invite.id });
		}
	}

	function getInviteUrl(invitation: GameInvite) {
		const url = constructClaimInvitation({ linkId: invitation.id });
		const finalUrl = new URL(url, window.location.href);
		return finalUrl.toString();
	}
}
