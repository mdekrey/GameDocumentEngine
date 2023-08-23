import { Decorator } from '@storybook/react';
import { useEffect } from 'react';
import { useDarkMode } from 'storybook-dark-mode';

export const StorybookDecorator: Decorator = (story, c) => {
	const actualDark = useDarkMode();

	useEffect(() => {
		// workarounds for current state of storybook-dark-mode
		applyDark(actualDark);
	}, [actualDark]);

	return story();
};

function applyDark(dark: boolean) {
	document.body.classList.add(dark ? 'dark' : 'light');
	document.body.classList.remove(dark ? 'light' : 'dark');
	document.documentElement.classList.add(dark ? 'dark' : 'light');
	document.documentElement.classList.remove(dark ? 'light' : 'dark');
}
