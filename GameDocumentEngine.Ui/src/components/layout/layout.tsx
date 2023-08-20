import { withSlots } from 'react-slot-component';
import { Modals } from '@/utils/modal/modal-service';
import { Header, HeaderProps } from '../header/header';
import { NetworkIndicatorProps } from '../network/network-indicator';
import styles from './layout.module.css';
import { twMerge } from 'tailwind-merge';

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
			<section
				className={twMerge(
					styles['sidebar-left'],
					'overflow-auto bg-slate-700 text-white',
					'bg-slate-200 text-slate-950',
					'dark:bg-slate-700 dark:text-white',
				)}
			>
				{slotProps.LeftSidebar?.children}
			</section>
			<main
				className={twMerge(
					styles.main,
					'overflow-auto',
					'bg-white text-slate-950',
					'dark:bg-slate-950 dark:text-white',
				)}
			>
				{children}
			</main>
			<section
				className={twMerge(
					styles['sidebar-right'],
					'overflow-auto bg-slate-700 text-white',
					'bg-slate-200 text-slate-950',
					'dark:bg-slate-700 dark:text-white',
				)}
			>
				{slotProps.RightSidebar?.children}
			</section>
			<Modals />
		</div>
	);
});
