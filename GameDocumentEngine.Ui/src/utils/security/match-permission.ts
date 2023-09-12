import { toPermissionPatternRegex } from './to-permission-pattern-regex';

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
