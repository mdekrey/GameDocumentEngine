import type { Preview } from '@storybook/react';
import '@/main.css';
import './preview.css';
import '@/utils/i18n/setup';
import { StorybookDecorator } from './components/StorybookDecorator';
import { useDarkMode } from 'storybook-dark-mode';
import { createElement, useEffect } from 'react';
import { themes } from '@storybook/theming';
import { DocsContainer } from '@storybook/blocks';
import { addons } from '@storybook/preview-api';

const channel = addons.getChannel();

const preview: Preview & { darkMode: unknown } = {
	darkMode: {
		classTarget: 'html',
		stylePreview: true,
	},
	parameters: {
		actions: { argTypesRegex: '^on[A-Z].*' },
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/,
			},
		},
		docs: {
			story: { iframeHeight: '300px' },
			container: (props) => {
				// workarounds for current state of storybook-dark-mode
				const isDark = useDarkMode();
				useEffect(() => {
					applyDark(isDark);

					return () => {
						// channel doesn't work for story iframes
						if (document.querySelector('iframe')) {
							window.location.reload();
						}
					};
				}, [isDark]);
				const currentProps = {
					...props,
					theme: isDark ? themes.dark : themes.light,
				};
				return createElement(DocsContainer, currentProps);
			},
		},
	},
	decorators: [StorybookDecorator],
};

function applyDark(dark: boolean) {
	document.body.classList.add(dark ? 'dark' : 'light');
	document.body.classList.remove(dark ? 'light' : 'dark');
	document.documentElement.classList.add(dark ? 'dark' : 'light');
	document.documentElement.classList.remove(dark ? 'light' : 'dark');
}

export default preview;
