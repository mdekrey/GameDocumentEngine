const escapedRegexCharacters = /([-[\]{}()*+?.,\\^$|#\s])/g;

const permissionMapping = new Map<string, RegExp>();

export function toPermissionPatternRegex(permissionPattern: string): RegExp {
	const cached = permissionMapping.get(permissionPattern);
	if (cached) return cached;
	const parts = permissionPattern
		.split('#')[0]
		.split(':')
		.map((part) => {
			switch (part) {
				case '*':
					return '[^:]+';
				case '**':
					return '.+';
				default:
					if (part.includes('**'))
						throw new Error(
							'Deep-path wildcards may only be used as complete segments',
						);
					return part.replace(escapedRegexCharacters, '\\$1');
			}
		});

	const result = new RegExp(`^${parts.join(':')}$`);
	permissionMapping.set(permissionPattern, result);
	return result;
}
