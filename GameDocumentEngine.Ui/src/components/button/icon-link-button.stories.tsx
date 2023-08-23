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

import { IconLinkButton } from './icon-link-button';
import type { ButtonTheme } from './buttonThemes';
import { buttonThemeNames } from './buttonThemes';
import type { Link } from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';

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
} & React.ComponentProps<typeof Link>) {
	const Component =
		theme === 'Primary' ? IconLinkButton : IconLinkButton[theme];
	const IconComponent = icons[icon];
	return (
		<MemoryRouter>
			<div>
				<Component {...props}>
					<IconComponent />
				</Component>
			</div>
		</MemoryRouter>
	);
}

const meta = {
	title: 'Components/Buttons/Icon Link Button',
	component: IconLinkButton,
	render: IconButtonStory,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		icon: { options: Object.keys(icons), control: { type: 'select' } },
		theme: { options: allThemes, control: { type: 'select' } },
	},
	args: {
		to: '#',
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
