import { Header, HeaderProps } from '../header/header';
import { Modals } from '@/utils/modal/modal-service';
import { NetworkIndicatorProps } from '../network/network-indicator';

export type LayoutProps = { children?: React.ReactNode } & HeaderProps &
	NetworkIndicatorProps;

export function Layout({
	children,
	menuItems,
	user,
	connectionState,
	onReconnect,
}: LayoutProps) {
	return (
		<div className="w-full h-full flex flex-col">
			<Header
				menuItems={menuItems}
				user={user}
				connectionState={connectionState}
				onReconnect={onReconnect}
			/>
			<main className="overflow-auto flex-1 bg-layout-empty text-white">
				{children}
			</main>
			<Modals />
		</div>
	);
}
