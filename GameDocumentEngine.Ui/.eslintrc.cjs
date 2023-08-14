/** @type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	plugins: ['@typescript-eslint', 'i18next'],
	extends: [
		// The order of these matter:
		// eslint baseline
		'eslint:recommended',
		// disables eslint rules in favor of using prettier separately
		'prettier',
		'plugin:react-hooks/recommended',
		'plugin:storybook/recommended',
	],
	rules: {
		// https://typescript-eslint.io/linting/troubleshooting/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
		'no-undef': 'off',
	},
	ignorePatterns: ['/src/api/**/*'],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	overrides: [
		{
			files: ['**/*.{ts,tsx}'],
			extends: [
				// Recommended typescript changes, which removes some "no-undef" checks that TS handles
				'plugin:@typescript-eslint/eslint-recommended',
				'plugin:@typescript-eslint/recommended-requiring-type-checking',
				'plugin:@typescript-eslint/recommended',
			],
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				project: './tsconfig.node.json',
				tsconfigRootDir: __dirname,
			},
			rules: {
				'i18next/no-literal-string': [
					2,
					{
						mode: 'jsx-text-only',
						'jsx-attributes': {
							include: ['title', 'alt'],
						},
					},
				],
				// TODO: no-unsafe-assignment seems broken with my config, especially around passing components as variables
				'@typescript-eslint/no-unsafe-assignment': [0],
			},
		},
		{
			files: ['**/*.stories.{ts,tsx}', '**/stories/**'],
			rules: {
				'i18next/no-literal-string': [0],
			},
		},
		{
			plugins: ['@typescript-eslint'],
			extends: [],
			files: ['src/**/*.{ts,tsx}'],
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: __dirname,
			},
		},
	],
};
