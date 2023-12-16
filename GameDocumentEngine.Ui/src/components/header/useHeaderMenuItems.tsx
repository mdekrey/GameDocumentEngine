import { queries } from '@/utils/api/queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MenuItemsConfiguration } from '../menu-items/menu-items';
import { useTranslation } from 'react-i18next';
import { HiPencil, HiSun, HiMoon } from 'react-icons/hi2';
import type { TFunction } from 'i18next';
import type { UserDetails } from '@/api/models/UserDetails';
import { useEffect } from 'react';
import { useCurrentUser } from '@/utils/api/hooks';

type UserOptions = {
	theme?: 'light' | 'dark';
};

export function useHeader() {
	const queryClient = useQueryClient();
	const userMutation = useMutation(queries.patchUser(queryClient));
	const user = useCurrentUser();
	const { t } = useTranslation(['layout']);
	const options: UserOptions = user?.options ?? {};
	const darkMode =
		(options.theme ??
			(window.matchMedia('prefers-color-scheme: dark').matches
				? 'dark'
				: 'light')) === 'dark';
	const switchMode = (mode: 'light' | 'dark') => {
		if (options.theme !== mode)
			userMutation.mutate([{ op: 'add', path: '/options/theme', value: mode }]);
		return mode;
	};
	useEffect(() => {
		if (darkMode) document.documentElement.classList.add('dark');
		else document.documentElement.classList.remove('dark');
	}, [darkMode]);

	const menuItems: MenuItemsConfiguration = getHeaderMenuItems(
		t,
		user,
		darkMode,
		switchMode,
	);
	return { menuItems, user };
}

export function getHeaderMenuItems(
	t: TFunction,
	user: UserDetails | undefined,
	darkMode: boolean,
	switchMode: (mode: 'light' | 'dark') => void,
): MenuItemsConfiguration {
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
