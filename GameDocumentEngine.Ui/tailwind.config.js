/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {},
		zIndex: {
			normal: 0,
			modalBackground: 10,
			modalForeground: 20,
		},
	},
	plugins: [],
};
