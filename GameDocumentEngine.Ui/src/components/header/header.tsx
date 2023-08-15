import { Fragment } from 'react';
import { twMerge } from 'tailwind-merge';

import { HiOutlineDocumentText } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import { Menu, Transition } from '@headlessui/react';
import { HeaderMenuLink } from './header-menu-link';
import {
	NetworkIndicator,
	NetworkIndicatorProps,
} from '../network/network-indicator';
import { AvatarButton } from '../avatar/avatar-button';
import { UserDetails } from '@/api/models/UserDetails';

export type MenuTab = {
	href: string;
	label: string;
};

export type HeaderProps = {
	mainItem?: MenuTab;
	user?: UserDetails;
} & NetworkIndicatorProps;

export function Header({
	mainItem,
	user,
	connectionState,
	onReconnect,
}: HeaderProps) {
	const { t } = useTranslation(['layout']);

	return (
		<>
			<div className="fixed w-full bg-brand-dark text-brand-white shadow-sm flex flex-row items-center gap-4 h-12 p-1">
				<MenuTabDisplay
					href="#/"
					label={t('header.app-title')}
					icon={HiOutlineDocumentText}
					labelClassName="font-bold"
				>
					{!mainItem && t('header.app-title')}
				</MenuTabDisplay>

				{mainItem && (
					<MenuTabDisplay
						href={mainItem.href}
						label={mainItem.label}
						labelClassName="font-bold"
					>
						{mainItem.label}
					</MenuTabDisplay>
				)}

				<div className="flex-1" />

				<NetworkIndicator
					connectionState={connectionState}
					onReconnect={onReconnect}
				/>

				<Menu as="div" className="relative block flex-none">
					<Menu.Button
						className="block"
						as={AvatarButton}
						user={user}
						title={t('header.menu')}
					/>

					<Transition
						as={Fragment}
						enter="transition ease-out duration-100"
						enterFrom="transform opacity-0 scale-95"
						enterTo="transform opacity-100 scale-100"
						leave="transition ease-in duration-75"
						leaveFrom="transform opacity-100 scale-100"
						leaveTo="transform opacity-0 scale-95"
					>
						<Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
							<div className="p-1">
								<HeaderMenuLink href="#/game">
									{t('menu.select-game')}
								</HeaderMenuLink>
								<HeaderMenuLink href="#/profile">
									{t('menu.edit-profile', { name: user?.name })}
								</HeaderMenuLink>
							</div>
						</Menu.Items>
					</Transition>
				</Menu>
			</div>
			<div className="h-12 flex-shrink-0" />
		</>
	);
}

function MenuTabDisplay({
	href,
	label,
	children,
	icon: Icon,
	labelClassName,
}: {
	href: string;
	label: string;
	children?: React.ReactNode;
	icon?: typeof HiOutlineDocumentText;
	labelClassName?: string;
}) {
	return (
		<a
			href={href}
			aria-label={label}
			className="flex flex-row items-center gap-1"
		>
			{Icon && <Icon className="h-8 w-8" />}
			<span className={twMerge('flex-1', labelClassName)}>{children}</span>
		</a>
	);
}
