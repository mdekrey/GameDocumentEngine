import { queries } from '@/utils/api/queries';
import { useQuery } from '@tanstack/react-query';
import { MenuItemsConfiguration } from '../menu-items/menu-items';
import { useTranslation } from 'react-i18next';
import { HiPencil } from 'react-icons/hi2';
import { TFunction } from 'i18next';
import { UserDetails } from '@/api/models/UserDetails';

export function useHeader() {
	const userQuery = useQuery(queries.getCurrentUser);
	const { t } = useTranslation(['layout']);
	const user = userQuery.data;

	const menuItems: MenuItemsConfiguration = getHeaderMenuItems(t, user);
	return { menuItems, user };
}

export function getHeaderMenuItems(
	t: TFunction,
	user?: UserDetails,
): MenuItemsConfiguration {
	return {
		itemGroups: [
			{
				name: 'main',
				items: [
					{ href: '#/game', label: t('menu.select-game') },
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
