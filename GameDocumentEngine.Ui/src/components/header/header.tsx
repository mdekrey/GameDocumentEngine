import { queries } from '@/utils/api/queries';
import { useQuery } from '@tanstack/react-query';
import { Fragment } from 'react';
import { twMerge } from 'tailwind-merge';

import { HiOutlineDocumentText, HiBars3 } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import { Menu, Transition } from '@headlessui/react';
import { HeaderMenuLink } from './header-menu-link';

export type MenuTab = {
	href: string;
	label: string;
};

export type HeaderProps = {
	mainItem?: MenuTab;
	menuTabs?: MenuTab[];
};

export function Header({ mainItem, menuTabs }: HeaderProps) {
	const { t } = useTranslation(['layout']);
	const userQuery = useQuery(queries.getCurrentUser);

	return (
		<>
			<div className="fixed w-full bg-white p-6 border-b border-gray-300 shadow-sm">
				<div className="flex-none flex flex-row items-center w-full gap-4">
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

					<div className="hidden md:contents">
						{menuTabs?.map(({ href, label }) => (
							<MenuTabDisplay label={label} href={href} key={href}>
								{label}
							</MenuTabDisplay>
						))}
					</div>

					<Menu as="div" className="relative inline-block flex-none ml-auto">
						<div>
							<Menu.Button
								className={twMerge(
									'block w-full justify-center px-2 py-2 text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700',
								)}
								title={t('header.menu')}
							>
								<HiBars3 />
							</Menu.Button>
						</div>

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
								<div className="px-1 py-1 ">
									<HeaderMenuLink href="#/game">
										{t('menu.select-game')}
									</HeaderMenuLink>
									<HeaderMenuLink href="#/profile">
										{t('menu.edit-profile', { name: userQuery.data?.name })}
									</HeaderMenuLink>
								</div>
							</Menu.Items>
						</Transition>
					</Menu>
				</div>
			</div>
			<div className="h-20 flex-shrink-0" />
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
			{Icon && <Icon />}
			<span className={twMerge('flex-1', labelClassName)}>{children}</span>
		</a>
	);
}
