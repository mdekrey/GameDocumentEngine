import type { Meta, StoryObj } from '@storybook/react';
import {
	HiPlus,
	HiLink,
	HiOutlineTrash,
	HiXMark,
	HiArrowRight,
	HiSignal,
	HiSignalSlash,
	HiOutlineCog,
	HiOutlineUserGroup,
	HiCheck,
	HiChevronUpDown,
	HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

import { IconButton } from './icon-button';
import type { ButtonTheme } from './buttonThemes';
import { buttonThemeNames } from './buttonThemes';

type StoryButtonTheme = ButtonTheme | 'Primary';
const allThemes: StoryButtonTheme[] = ['Primary', ...buttonThemeNames];

const icons = {
	HiPlus,
	HiLink,
	HiOutlineTrash,
	HiXMark,
	HiArrowRight,
	HiSignal,
	HiSignalSlash,
	HiOutlineCog,
	HiOutlineUserGroup,
	HiCheck,
	HiChevronUpDown,
	HiOutlineExclamationTriangle,
};

function IconButtonStory({
	theme,
	icon,
	...props
}: {
	theme: ButtonTheme | 'Primary';
	icon: keyof typeof icons;
} & JSX.IntrinsicElements['button']) {
	const Component = theme === 'Primary' ? IconButton : IconButton[theme];
	const IconComponent = icons[icon];
	return (
		<Component {...props}>
			<IconComponent />
		</Component>
	);
}

const meta = {
	title: 'Components/Buttons/Icon Button',
	component: IconButton,
	render: IconButtonStory,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		disabled: { control: { type: 'boolean' } },
		icon: { options: Object.keys(icons), control: { type: 'select' } },
		theme: { options: allThemes, control: { type: 'select' } },
	},
	args: {
		disabled: false,
		icon: 'HiPlus',
		title: 'Button Title',
	},
} satisfies Meta<typeof IconButtonStory>;

export default meta;

function themeStory(
	theme: StoryButtonTheme,
	args?: Partial<React.ComponentProps<typeof IconButtonStory>>,
): StoryObj<typeof meta> {
	return {
		args: {
			theme,
			...(args as Omit<React.ComponentProps<typeof IconButtonStory>, 'theme'>),
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
