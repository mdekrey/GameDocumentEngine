import tailwindConfig from '../../tailwind.config';
import resolveConfig from 'tailwindcss/resolveConfig';
import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette';

const fullConfig = resolveConfig(tailwindConfig);

export const colors = flattenColorPalette(fullConfig.theme?.colors);
export const allColorNames = Object.keys(colors);
