import { IconButton } from '@/components/button/icon-button';
import { queries } from '@/utils/api/queries';
import { NarrowContent } from '@/utils/containers/narrow-content';
import { useModal } from '@/utils/modal/modal-service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { HiPlus, HiLink, HiOutlineTrash, HiX } from 'react-icons/hi';
import { CreateInvite } from './create-invite';
import { formatDistanceToNow } from 'date-fns';
import { GameInvite } from '@/api/models/GameInvite';
import { constructUrl as constructClaimInvitation } from '@/api/operations/claimInvitation';

export function GameInvites({ gameId }: { gameId: string }) {
	const gameData = useQuery(queries.getGameDetails(gameId));
	const invitationsResult = useQuery(queries.listInvitations(gameId));
	const launchModal = useModal();
	const copyLink = useMutation({
		mutationFn: async (invitation: GameInvite) => {
			const url = constructClaimInvitation({ linkId: invitation.id });
			const finalUrl = new URL(url, window.location.href);
			await navigator.clipboard.writeText(finalUrl.toString());
		},
	});

	if (invitationsResult.isLoading || gameData.isLoading) {
		return 'Loading';
	}
	if (!invitationsResult.isSuccess || !gameData.isSuccess) {
		return 'An error occurred loading invitations.';
	}

	const gameDetails = gameData.data;
	const invitations = Object.values(invitationsResult.data);

	return (
		<NarrowContent>
			<div className="flex flex-row gap-3">
				<h1 className="text-2xl font-bold flex-1">Invites</h1>

				<IconButton.Save onClick={createInvite}>
					<HiPlus />
				</IconButton.Save>
			</div>
			<ul className="grid grid-cols-[auto,auto,auto,auto] gap-3 items-center justify-items-center">
				<li className="contents">
					<span>Role:</span>
					<span>Uses:</span>
					<span>Expires:</span>
					<span>{/* Actions */}</span>
				</li>
				{invitations.length ? (
					invitations.map((invite) => (
						<li key={invite.id} className="contents">
							{copyLink.isSuccess && copyLink.variables?.id === invite.id ? (
								<>
									<span className="col-span-4 justify-self-stretch bg-green-200 border-green-400 rounded-full text-green-800 text-center p-1 pl-3 flex gap-3 justify-between items-center">
										Copied link to clipboard!
										<IconButton.Save onClick={() => copyLink.reset()}>
											<HiX />
										</IconButton.Save>
									</span>
								</>
							) : (
								<>
									<span>{invite.role /* TODO: translate */}</span>
									<span>
										{invite.usesRemaining === -1
											? 'Unlimited'
											: invite.usesRemaining}
									</span>
									<span>
										in {formatDistanceToNow(Date.parse(invite.expiration))}
									</span>
									<span className="justify-self-end flex flex-row-reverse gap-3 p-1">
										<IconButton onClick={() => copyLink.mutate(invite)}>
											<HiLink />
										</IconButton>
										<IconButton.Destructive>
											<HiOutlineTrash />
										</IconButton.Destructive>
									</span>
								</>
							)}
						</li>
					))
				) : (
					<li>No open invitations</li>
				)}
			</ul>
		</NarrowContent>
	);

	function createInvite() {
		void launchModal({
			additional: {
				gameId,
				gameData: gameDetails,
			},
			ModalContents: CreateInvite,
		});
	}
}
