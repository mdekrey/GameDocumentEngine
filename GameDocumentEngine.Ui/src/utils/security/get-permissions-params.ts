import { matchPermission } from './match-permission';

export function matchingPermissionParams(
	permissionList: string[],
	targetPermission: string,
) {
	return permissionList
		.filter((permission) => permission.includes('#'))
		.filter((permission) => matchPermission(permission, targetPermission))
		.map((permission) => permission.substring(permission.indexOf('#') + 1));
}
