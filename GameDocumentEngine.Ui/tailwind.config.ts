import type { Config } from 'tailwindcss';
import defaultColors from 'tailwindcss/colors';

const config: Config = {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		colors: {
			current: 'currentColor',
			inherit: 'inherit',
			transparent: 'transparent',

			black: defaultColors.black,
			white: defaultColors.white,

			brand: {
				dark: defaultColors.slate[950],
				white: defaultColors.white,
			},

			'slate-50': defaultColors.slate[50],
			'slate-100': defaultColors.slate[100],
			'slate-200': defaultColors.slate[200],
			'slate-300': defaultColors.slate[300],
			'slate-400': defaultColors.slate[400],
			'slate-500': defaultColors.slate[500],
			'slate-600': defaultColors.slate[600],
			'slate-700': defaultColors.slate[700],
			'slate-800': defaultColors.slate[800],
			'slate-900': defaultColors.slate[900],
			'slate-950': defaultColors.slate[950],
			'red-100': defaultColors.red[100],
			'red-200': defaultColors.red[200],
			'red-500': defaultColors.red[500],
			'red-600': defaultColors.red[600],
			'red-700': defaultColors.red[700],
			'red-800': defaultColors.red[800],
			'green-200': defaultColors.green[200],
			'green-400': defaultColors.green[400],
			'green-500': defaultColors.green[500],
			'green-600': defaultColors.green[600],
			'green-800': defaultColors.green[800],
			'blue-700': defaultColors.blue[700],
			'blue-950': defaultColors.blue[950],
			'indigo-500': defaultColors.indigo[500],
			'violet-500': defaultColors.violet[500],
		},
		extend: {},
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
