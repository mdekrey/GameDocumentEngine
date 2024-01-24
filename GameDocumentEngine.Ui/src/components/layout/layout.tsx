import { withSlots } from 'react-slot-component';
import { Modals, hasOpenModal } from '@/utils/modal/modal-service';
import type { HeaderProps } from '../header/header';
import { Header } from '../header/header';
import styles from './layout.module.css';
import { twMerge } from 'tailwind-merge';
import { HiOutlineEllipsisVertical } from 'react-icons/hi2';
import { IconButton } from '../button/icon-button';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from 'jotai';
import { elementTemplate } from '../template';

export type LayoutProps = { children?: React.ReactNode } & HeaderProps;

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

function useInert<TElem extends HTMLElement>() {
	const ref = useRef<TElem>(null);
	const store = useStore();
	useEffect(() => {
		store.sub(hasOpenModal, updateInert);
		updateInert();
		function updateInert() {
			if (store.get(hasOpenModal)) ref.current?.setAttribute('inert', 'inert');
			else ref.current?.removeAttribute('inert');
		}
	}, [store]);
	return ref;
}

const base = elementTemplate('Base', 'section', (T) => (
	<T tabIndex={0} className="overflow-auto text-slate-950 dark:text-white" />
));
const Sidebar = base
	.extend('Sidebar', (T) => (
		<T tabIndex={0} className="bg-slate-200 dark:bg-slate-700" />
	))
	.themed({
		Left: (T) => <T className={styles['sidebar-left']} />,
		Right: (T) => <T className={styles['sidebar-right']} />,
	});
const Main = base.extend('Main', () => (
	<main tabIndex={-1} className="bg-white dark:bg-slate-950" />
));

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

	const location = useLocation();
	useEffect(() => {
		// This feels like a hack, but it works. This may not be good for
		// accessibility, however. Need to check with an expert.
		return () => document.querySelector('main')?.focus();
	}, [location]);
	const rootRef = useInert<HTMLDivElement>();
	return (
		<>
			<LayoutPresentation
				slotProps={slotProps}
				rootRef={rootRef}
				menuItems={menuItems}
				user={user}
				connectionState={connectionState}
				onReconnect={onReconnect}
				leftSidebar={leftSidebar}
				children={children}
				rightSidebar={rightSidebar}
			/>
			<Modals />
		</>
	);
});

function LayoutPresentation({
	slotProps,
	menuItems,
	user,
	connectionState,
	onReconnect,
	children,
	rootRef,
	leftSidebar,
	rightSidebar,
}: {
	slotProps: Partial<LayoutSlots>;
	children?: React.ReactNode;
	rootRef: React.RefObject<HTMLDivElement>;
	leftSidebar: React.RefObject<HTMLElement>;
	rightSidebar: React.RefObject<HTMLElement>;
} & HeaderProps) {
	return (
		<div
			className={styles.layout}
			data-left-drawer={slotProps.LeftSidebar ? true : false}
			data-right-drawer={slotProps.RightSidebar ? true : false}
			ref={rootRef}
		>
			<Header
				menuItems={menuItems}
				user={user}
				connectionState={connectionState}
				onReconnect={onReconnect}
				className={styles.header}
			>
				{slotProps.Subheader && (
					<nav className="hidden lg:block max-w-screen-md flex-1 px-4 py-1 bg-slate-100 dark:bg-slate-900 rounded-sm shadow-inner">
						{slotProps.Subheader?.children}
					</nav>
				)}
			</Header>

			{slotProps.Subheader && (
				<nav
					className={twMerge(
						styles.subheader,
						'lg:hidden bg-slate w-full bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-sm flex flex-row items-center gap-2 h-12 p-1',
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

			<Sidebar.Left ref={leftSidebar}>
				{slotProps.LeftSidebar?.children}
			</Sidebar.Left>
			<Main className={styles.main}>{children}</Main>
			<Sidebar.Right ref={rightSidebar}>
				{slotProps.RightSidebar?.children}
			</Sidebar.Right>

			<div className={styles.backdrop}></div>
		</div>
	);
}
