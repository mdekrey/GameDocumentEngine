import type { Config } from 'tailwindcss';
import defaultColors from 'tailwindcss/colors';

const config: Config = {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	darkMode: 'class',
	theme: {
		colors: {
			current: 'currentColor',
			inherit: 'inherit',
			transparent: 'transparent',

			black: defaultColors.black,
			white: defaultColors.white,

			slate: defaultColors.slate,
			red: defaultColors.red,
			green: defaultColors.green,
			blue: defaultColors.blue,
		},
		extend: {
			fontFamily: {
				handwriting: ['Permanent Marker', 'sans-serif'],
			},
		},
		zIndex: {
			normal: '0',
			dropdown: '5',
			modalBackground: '10',
			modalForeground: '20',
		},
	},
	plugins: [],
};

export default config;
