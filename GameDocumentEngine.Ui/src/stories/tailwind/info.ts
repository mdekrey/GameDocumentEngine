import tailwindConfig from '../../../tailwind.config';
import resolveConfig from 'tailwindcss/resolveConfig';
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette';

const fullConfig = resolveConfig(tailwindConfig);

if (!fullConfig.theme) throw new Error('tailwind config failed to parse');
console.log(fullConfig.theme);

export const colors = flattenColorPalette(fullConfig.theme.colors);

export const fontFamilies = fullConfig.theme.fontFamily ?? {};
export const fontSizes = Object.fromEntries(
	Object.entries(fullConfig.theme.fontSize ?? {}).map(([sizeName, config]) => [
		sizeName,
		toFontSizeStyle(config),
	]),
);
type FontSizeOptions = {
	lineHeight?: string;
	letterSpacing?: string;
	fontWeight?: string | number;
};
function toFontSizeStyle(
	value:
		| string
		| [fontSize: string]
		| [fontSize: string, lineHeight: string]
		| [fontSize: string, options: FontSizeOptions],
): React.CSSProperties {
	const [fontSize, options] = Array.isArray(value) ? value : [value];

	const { lineHeight, letterSpacing, fontWeight } =
		typeof options === 'object'
			? options
			: ({ lineHeight: options } as FontSizeOptions);

	return {
		fontSize,
		lineHeight,
		letterSpacing,
		fontWeight,
	};
}
