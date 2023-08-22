import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';
import { buttonThemeNames, ButtonTheme } from './buttonThemes';

type StoryButtonTheme = ButtonTheme | 'Primary';
const allThemes: StoryButtonTheme[] = ['Primary', ...buttonThemeNames];

function ButtonStory({
	theme,
	...props
}: { theme: ButtonTheme | 'Primary' } & JSX.IntrinsicElements['button']) {
	const Component = theme === 'Primary' ? Button : Button[theme];
	return <Component {...props} />;
}

const meta = {
	title: 'Components/Buttons/Button',
	component: Button,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		disabled: { control: { type: 'boolean' } },
		theme: { options: allThemes, control: { type: 'select' } },
		onClick: { type: 'function' },
	},
	args: {
		disabled: false,
		children: 'Button',
	},
	render: ButtonStory,
} satisfies Meta<typeof ButtonStory>;

export default meta;

function themeStory(
	theme: StoryButtonTheme,
	args?: React.ComponentProps<typeof Button>,
): StoryObj<typeof meta> {
	return {
		args: {
			theme,
			...args,
		},
	};
}

export const Primary = themeStory('Primary');
export const Destructive = themeStory('Destructive');
export const Save = themeStory('Save');
export const Secondary = themeStory('Secondary');
export const DestructiveSecondary = themeStory('DestructiveSecondary');

export const DisabledPrimary = themeStory('Primary', { disabled: true });
export const DisabledDestructive = themeStory('Destructive', {
	disabled: true,
});
export const DisabledSave = themeStory('Save', { disabled: true });
export const DisabledSecondary = themeStory('Secondary', { disabled: true });
export const DisabledDestructiveSecondary = themeStory('DestructiveSecondary', {
	disabled: true,
});
