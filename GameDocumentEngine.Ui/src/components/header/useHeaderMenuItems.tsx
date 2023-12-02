import { queries } from '@/utils/api/queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MenuItemsConfiguration } from '../menu-items/menu-items';
import { useTranslation } from 'react-i18next';
import { HiPencil, HiSun, HiMoon } from 'react-icons/hi2';
import type { TFunction } from 'i18next';
import type { UserDetails } from '@/api/models/UserDetails';
import { useEffect } from 'react';
import { useRealtimeApi } from '@/utils/api/realtime-api';

type UserOptions = {
	theme?: 'light' | 'dark';
};

export function useHeader() {
	const realtimeApi = useRealtimeApi();
	const queryClient = useQueryClient();
	const userMutation = useMutation(queries.patchUser(queryClient));
	const userQuery = useQuery(queries.getCurrentUser(realtimeApi));
	const { t } = useTranslation(['layout']);
	const user = userQuery.data;
	const options: UserOptions = user?.options ?? {};
	const switchMode = (mode: 'light' | 'dark') => {
		if (options.theme !== mode)
			userMutation.mutate([{ op: 'add', path: '/options/theme', value: mode }]);
		return mode;
	};
	useEffect(() => {
		const mode =
			options.theme ??
			(window.matchMedia('prefers-color-scheme: dark').matches
				? 'dark'
				: 'light');
		if (mode === 'dark') document.documentElement.classList.add('dark');
		else document.documentElement.classList.remove('dark');
	}, [options.theme]);

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
