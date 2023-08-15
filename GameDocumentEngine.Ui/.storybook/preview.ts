import type { Preview } from '@storybook/react';
import '@/main.css';
import '@/utils/i18n/setup';
import { theme } from './theme';

const preview: Preview = {
	parameters: {
		actions: { argTypesRegex: '^on[A-Z].*' },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/,
			},
		},
		docs: {
			theme,
		},
	},
};

export default preview;
