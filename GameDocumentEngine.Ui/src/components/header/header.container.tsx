import { queries } from '@/utils/api/queries';
import { useQuery } from '@tanstack/react-query';

import { useNetworkIndicator } from '../network/useNetworkIndicator';
import { Header, MenuTab } from './header';

export type HeaderContainerProps = {
	mainItem?: MenuTab;
};

export function HeaderContainer({ mainItem }: HeaderContainerProps) {
	const userQuery = useQuery(queries.getCurrentUser);
	const networkIndicator = useNetworkIndicator();

	return (
		<Header {...networkIndicator} mainItem={mainItem} user={userQuery.data} />
	);
}
