import { queries } from '@/utils/api/queries';
import { useQuery } from '@tanstack/react-query';
import type { MenuItemsConfiguration } from '../menu-items/menu-items';
import { useTranslation } from 'react-i18next';
import { HiPencil, HiSun, HiMoon } from 'react-icons/hi2';
import type { TFunction } from 'i18next';
import type { UserDetails } from '@/api/models/UserDetails';
import { useEffect, useReducer } from 'react';

export function useHeader() {
	const userQuery = useQuery(queries.getCurrentUser);
	const { t } = useTranslation(['layout']);
	const user = userQuery.data;
	const [, switchMode] = useReducer(
		(_prev: 'light' | 'dark', mode: 'light' | 'dark') => {
			if (mode === 'dark') document.documentElement.classList.add('dark');
			else document.documentElement.classList.remove('dark');
			return mode;
		},
		window.matchMedia('prefers-color-scheme: dark').matches ? 'dark' : 'light',
	);

	useEffect(() => {
		const prefersDark = window.matchMedia('prefers-color-scheme: dark').matches;
		if (prefersDark) document.documentElement.classList.add('dark');
	}, []);

	const menuItems: MenuItemsConfiguration = getHeaderMenuItems(
		t,
		user,
		switchMode,
	);
	return { menuItems, user };
}

export function getHeaderMenuItems(
	t: TFunction,
	user: UserDetails | undefined,
	switchMode: (mode: 'light' | 'dark') => void,
): MenuItemsConfiguration {
	const darkMode = document.documentElement.classList.contains('dark');
	return {
		itemGroups: [
			{
				name: 'main',
				items: [
					{ href: '#/game', label: t('menu.select-game') },
					darkMode
						? {
								onClick: () => switchMode('light'),
								icon: HiSun,
								label: t('menu.switch-to-light-mode'),
						  }
						: {
								onClick: () => switchMode('dark'),
								icon: HiMoon,
								label: t('menu.switch-to-dark-mode'),
						  },
					{
						href: '#/profile',
						icon: HiPencil,
						label: t('menu.edit-profile', { name: user?.name }),
					},
				],
			},
		],
	};
}
