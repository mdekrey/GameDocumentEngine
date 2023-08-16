import { withSlots } from 'react-slot-component';
import { Modals } from '@/utils/modal/modal-service';
import { Header, HeaderProps } from '../header/header';
import { NetworkIndicatorProps } from '../network/network-indicator';
import styles from './layout.module.css';

export type LayoutProps = { children?: React.ReactNode } & HeaderProps &
	NetworkIndicatorProps;

export type LayoutSlots = {
	LeftSidebar: {
		children: React.ReactNode;
	};
	RightSidebar: {
		children: React.ReactNode;
	};
};

export const Layout = withSlots<LayoutSlots, LayoutProps>(function Layout({
	children,
	menuItems,
	user,
	connectionState,
	onReconnect,
	slotProps,
}) {
	return (
		<div
			className={styles.layout}
			data-left-drawer={slotProps.LeftSidebar ? true : false}
			data-right-drawer={slotProps.RightSidebar ? true : false}
		>
			<Header
				menuItems={menuItems}
				user={user}
				connectionState={connectionState}
				onReconnect={onReconnect}
				className={styles.header}
			/>
			<section className={styles['sidebar-left']}>
				{slotProps.LeftSidebar?.children}
			</section>
			<main className={styles.main}>{children}</main>
			<section className={styles['sidebar-right']}>
				{slotProps.RightSidebar?.children}
			</section>
			<Modals />
		</div>
	);
});
