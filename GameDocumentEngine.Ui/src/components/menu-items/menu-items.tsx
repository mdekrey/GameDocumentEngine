import { Menu } from '@headlessui/react';
import type { IconType } from 'react-icons';
import { MenuLink } from './menu-link';
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

	label: string;
} & ({ href: string } | { onClick: () => void });

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
			className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-slate-300 dark:divide-slate-700 rounded-md bg-slate-200 dark:bg-slate-800 shadow-lg ring-1 ring-white dark:ring-black ring-opacity-5 focus:outline-none"
		>
			{menuItems.itemGroups.map((g) => (
				<div className="p-1" key={g.name}>
					{g.items.map(({ icon, label, ...rest }, index) => (
						<MenuLink key={index} {...rest} icon={icon}>
							{label}
						</MenuLink>
					))}
				</div>
			))}
		</Menu.Items>
	);
});
