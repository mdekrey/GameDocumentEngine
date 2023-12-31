declare module 'tailwindcss/lib/util/flattenColorPalette' {
	import type { RecursiveKeyValuePair } from 'tailwindcss/types/config';

	export default function flattenColorPalette(
		param: RecursiveKeyValuePair<string, string> | undefined,
	): Record<string, string>;
}
