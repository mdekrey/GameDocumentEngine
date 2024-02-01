import { IconButton } from '@/components/button/icon-button';
import { useLaunchModal } from '@/utils/modal/modal-service';
import { useMutation } from '@tanstack/react-query';
import { HiPlus, HiLink, HiOutlineTrash, HiXMark } from 'react-icons/hi2';
import { CreateInvite } from './create-invite';
import { formatDistanceToNow } from 'date-fns';
import type { GameInvite } from '@vaultvtt/api/openapi/models/GameInvite';
import { Trans, useTranslation } from 'react-i18next';
import { useGame, useInvitations } from '@/utils/api/hooks';
import { hasGamePermission } from '@/utils/security/match-permission';
import {
	createInvitation,
	cancelInvitation,
} from '@/utils/security/permission-strings';
import { getGameTypeTranslationNamespace } from '@/utils/api/accessors';
import { getInviteUrl } from './getInviteUrl';
import { useDeleteInvite } from './delete-invite';
import { elementTemplate } from '@/components/template';

const PillBar = elementTemplate('PillBar', 'div', (T) => (
	<T className="bg-green-200 border-green-400 rounded-full text-green-800 text-center p-1 pl-3 flex gap-3 justify-between items-center" />
));

export function GameInvites({ gameId }: { gameId: string }) {
	const { t } = useTranslation(['list-invites']);

	const gameDetails = useGame(gameId);
	const invitations = useInvitations(gameId);
	const launchModal = useLaunchModal();
	const copyLink = useMutation({
		mutationFn: async (invitation: GameInvite) => {
			await navigator.clipboard.writeText(getInviteUrl(invitation));
		},
	});

	const allowCreate = gameDetails.typeInfo.userRoles.some((role) =>
		hasGamePermission(gameDetails, (id) => createInvitation(id, role)),
	);
	const allowCancel = hasGamePermission(gameDetails, cancelInvitation);
	const onDeleteInvite = useDeleteInvite(gameId);

	return (
		<>
			<div className="flex flex-row gap-3">
				<h1 className="text-2xl font-bold flex-1">{t('title')}</h1>
				{allowCreate && (
					<IconButton.Save title={t('create-new')} onClick={createInvite}>
						<HiPlus />
					</IconButton.Save>
				)}
			</div>
			<table className="w-full">
				<thead>
					<tr>
						<th className="text-left">{t('table.role')}</th>
						<th>{t('table.uses')}</th>
						<th>{t('table.expires')}</th>
						<th className="sr-only">{t('table.actions')}</th>
					</tr>
				</thead>
				<tbody>
					{invitations.length ? (
						invitations.map((invite) => (
							<tr key={invite.id}>
								{copyLink.isSuccess && copyLink.variables?.id === invite.id ? (
									<td colSpan={4}>
										<PillBar>
											{t('copied-to-clipboard')}
											<IconButton.Save
												title={t('cancel-copied-notice')}
												onClick={() => copyLink.reset()}
											>
												<HiXMark />
											</IconButton.Save>
										</PillBar>
									</td>
								) : (
									<>
										<td>
											<Trans
												ns={getGameTypeTranslationNamespace(
													gameDetails.typeInfo.key,
												)}
												i18nKey={`roles.${invite.role}.name`}
											/>
										</td>
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
											{allowCancel && (
												<IconButton.Destructive
													title={t('delete')}
													onClick={() => void onDeleteInvite(invite)}
												>
													<HiOutlineTrash />
												</IconButton.Destructive>
											)}
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
				</tbody>
			</table>
		</>
	);

	function createInvite() {
		void launchModal({
			additional: { gameId },
			ModalContents: CreateInvite,
		});
	}
}
