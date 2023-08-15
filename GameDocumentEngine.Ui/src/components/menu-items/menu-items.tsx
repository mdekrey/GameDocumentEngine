import { Menu } from '@headlessui/react';
import type { IconType } from 'react-icons';
import { HeaderMenuLink } from './header-menu-link';
import { forwardRef } from 'react';

export type MenuItemsConfiguration = {
	itemGroups: MenuItemGroup[];
};

export type MenuItemGroup = {
	name: string;
	items: MenuItem[];
};

export type MenuItem = {
	icon?: IconType;
	href: string;
	label: string;
};

export const MenuItems = forwardRef(function MenuItems(
	{
		menuItems,
	}: {
		menuItems: MenuItemsConfiguration;
	},
	ref: React.ForwardedRef<HTMLDivElement>,
) {
	return (
		<Menu.Items
			ref={ref}
			className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-brand-dark shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
		>
			{menuItems.itemGroups.map((g) => (
				<div className="p-1" key={g.name}>
					{g.items.map((item, index) => (
						<HeaderMenuLink key={index} href={item.href} icon={item.icon}>
							{item.label}
						</HeaderMenuLink>
					))}
				</div>
			))}
		</Menu.Items>
	);
});
