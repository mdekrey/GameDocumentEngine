import { withSlots } from 'react-slot-component';
import { Modals } from '@/utils/modal/modal-service';
import type { HeaderProps } from '../header/header';
import { Header } from '../header/header';
import type { NetworkIndicatorProps } from '../network/network-indicator';
import styles from './layout.module.css';
import { twMerge } from 'tailwind-merge';
import { HiOutlineEllipsisVertical } from 'react-icons/hi2';
import { IconButton } from '../button/icon-button';
import { useRef } from 'react';

export type LayoutProps = { children?: React.ReactNode } & HeaderProps &
	NetworkIndicatorProps;

export type LayoutSlots = {
	Subheader: {
		children?: React.ReactNode;
	};
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
	const leftSidebar = useRef<HTMLElement>(null);
	const rightSidebar = useRef<HTMLElement>(null);
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
			>
				<nav className="hidden lg:block max-w-screen-md flex-1 px-4 py-1 bg-slate-100 dark:bg-slate-900 rounded-sm shadow-inner">
					{slotProps.Subheader?.children}
				</nav>
			</Header>

			{slotProps.Subheader && (
				<nav
					className={twMerge(
						styles.subheader,
						'bg-slate w-full bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-sm flex flex-row items-center gap-2 h-12 p-1',
					)}
				>
					{slotProps.LeftSidebar && (
						<IconButton.Secondary
							className="lg:hidden"
							onClick={() => leftSidebar?.current?.focus()}
						>
							<HiOutlineEllipsisVertical className="h-8 w-8" />
						</IconButton.Secondary>
					)}
					<div className="flex-1">{slotProps.Subheader?.children}</div>
				</nav>
			)}

			<section
				ref={leftSidebar}
				tabIndex={0}
				className={styles['sidebar-left']}
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
				ref={rightSidebar}
				tabIndex={0}
				className={styles['sidebar-right']}
			>
				{slotProps.RightSidebar?.children}
			</section>

			<div className={styles.backdrop}></div>

			<Modals />
		</div>
	);
});
