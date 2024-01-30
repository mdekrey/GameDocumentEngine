import type { GameInvite } from '@/api/models/GameInvite';
import { constructUrl as constructClaimInvitation } from '@/api/operations/claimInvitation';

export function getInviteUrl(invitation: GameInvite) {
	const url = constructClaimInvitation({ linkId: invitation.id });
	const finalUrl = new URL(url, window.location.href);
	return finalUrl.toString();
}
