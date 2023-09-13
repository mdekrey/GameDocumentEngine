import { GameDetails } from '@/api/models/GameDetails';
import { toPermissionPatternRegex } from './to-permission-pattern-regex';
import { DocumentDetails } from '@/api/models/DocumentDetails';

export function matchPermission(
	permissionPattern: string,
	targetPermission: string,
) {
	const pattern = toPermissionPatternRegex(permissionPattern);
	const result = pattern.exec(targetPermission);
	return !!result;
}

export function hasPermission(
	permissionList: string[],
	targetPermission: string,
) {
	return permissionList.some((permissionPattern) =>
		matchPermission(permissionPattern, targetPermission),
	);
}

export function hasGamePermission(
	gameDetails: GameDetails,
	permissionString: (gameId: string) => string,
) {
	return hasPermission(
		gameDetails.permissions,
		permissionString(gameDetails.id),
	);
}

export function hasDocumentPermission(
	gameDetails: GameDetails,
	documentDetails: DocumentDetails,
	permissionString: (gameId: string, documentId: string) => string,
) {
	return hasPermission(
		[...gameDetails.permissions, ...documentDetails.permissions],
		permissionString(gameDetails.id, documentDetails.id),
	);
}
