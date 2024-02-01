import type { GameInvite } from '@vaultvtt/api/openapi/models/GameInvite';
import { constructUrl as constructClaimInvitation } from '@vaultvtt/api/openapi/operations/claimInvitation';

export function getInviteUrl(invitation: GameInvite) {
	const url = constructClaimInvitation({ linkId: invitation.id });
	const finalUrl = new URL(url, window.location.href);
	return finalUrl.toString();
}
