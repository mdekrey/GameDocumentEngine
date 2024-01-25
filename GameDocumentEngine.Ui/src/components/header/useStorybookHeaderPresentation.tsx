import { getHeaderMenuItems } from './useHeaderMenuItems';
import type { HubConnectionState } from '@microsoft/signalr';
import { useAsAtom } from '@principlestudios/jotai-react-signals';
import { useCallback, useMemo } from 'react';
import { randomUser } from '@/utils/stories/sample-data';
import { useTranslation } from 'react-i18next';
import type { HeaderPresentationProps } from './useHeaderPresentation';
import { Header } from './header';

export function useStorybookHeaderPresentation({
	hasUser,
	connectionState,
	onReconnect,
}: {
	hasUser: boolean;
	connectionState: HubConnectionState;
	onReconnect?: () => void;
}): React.FC<HeaderPresentationProps> {
	const user = useMemo(() => (hasUser ? randomUser() : undefined), [hasUser]);
	const { t } = useTranslation(['layout']);
	const connectionState$ = useAsAtom(connectionState);
	const reconnect = useCallback(async () => {
		onReconnect?.();
		await new Promise((resolve) => setTimeout(resolve, 5000));
	}, [onReconnect]);
	return useCallback(
		({ className, children }) => (
			<Header
				connectionState={connectionState$}
				onReconnect={reconnect}
				menuItems={getHeaderMenuItems(t, user, false, () => void 0)}
				user={user}
				className={className}
			>
				{children}
			</Header>
		),
		[connectionState$, reconnect, t, user],
	);
}
