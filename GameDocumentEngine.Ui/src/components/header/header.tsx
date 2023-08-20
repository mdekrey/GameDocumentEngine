import { Fragment } from 'react';
import { twMerge } from 'tailwind-merge';

import type { IconType } from 'react-icons';
import { HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import { Menu, Transition } from '@headlessui/react';
import {
	NetworkIndicator,
	NetworkIndicatorProps,
} from '../network/network-indicator';
import { AvatarButton } from '../avatar/avatar-button';
import { UserDetails } from '@/api/models/UserDetails';
import { MenuItems, MenuItemsConfiguration } from '../menu-items/menu-items';

export type HeaderLayoutProps = {
	className?: string;
};

export type HeaderProps = {
	menuItems: MenuItemsConfiguration;
	user?: UserDetails;
} & NetworkIndicatorProps;

export function Header({
	className,
	menuItems,
	user,
	connectionState,
	onReconnect,
}: HeaderProps & HeaderLayoutProps) {
	const { t } = useTranslation(['layout']);

	return (
		<div
			className={twMerge(
				'w-full bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm flex flex-row items-center gap-4 h-12 p-1 z-normal',
				className,
			)}
		>
			<MenuTabDisplay
				href="#/"
				label={t('header.app-title')}
				icon={HiOutlineClipboardDocumentList}
				className="z-normal"
				labelClassName="font-bold"
			>
				{t('header.app-title')}
			</MenuTabDisplay>

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
					<MenuItems menuItems={menuItems} />
				</Transition>
			</Menu>
		</div>
	);
}

function MenuTabDisplay({
	href,
	label,
	children,
	icon: Icon,
	className,
	labelClassName,
}: {
	href: string;
	label: string;
	children?: React.ReactNode;
	icon?: IconType;
	className?: string;
	labelClassName?: string;
}) {
	return (
		<a
			href={href}
			aria-label={label}
			className={twMerge('flex flex-row items-center gap-1', className)}
		>
			{Icon && <Icon className="h-8 w-8" />}
			<span className={twMerge('flex-1', labelClassName)}>{children}</span>
		</a>
	);
}
