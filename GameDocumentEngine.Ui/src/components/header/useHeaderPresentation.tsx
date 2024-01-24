import { useNetworkIndicator } from '@/components/network/useNetworkIndicator';
import { useHeader } from './useHeaderMenuItems';
import { Header } from './header';
import { useCallback } from 'react';

export type HeaderPresentationProps = {
	className?: string;
	children?: React.ReactNode;
};
export function useHeaderPresentation(): React.FC<HeaderPresentationProps> {
	const { connectionState, onReconnect } = useNetworkIndicator();
	const { menuItems, user } = useHeader();
	return useCallback(
		({ className, children }) => (
			<Header
				menuItems={menuItems}
				user={user}
				connectionState={connectionState}
				onReconnect={onReconnect}
				className={className}
			>
				{children}
			</Header>
		),
		[connectionState, menuItems, onReconnect, user],
	);
}
