import { Modals, hasOpenModal } from '@/utils/modal/modal-service';
import styles from './layout.module.css';
import { twMerge } from 'tailwind-merge';
import { HiOutlineEllipsisVertical } from 'react-icons/hi2';
import { IconButton } from '../button/icon-button';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useStore } from 'jotai';
import { elementTemplate } from '../template';
import type { HeaderPresentationProps } from '../header/useHeaderPresentation';
import { LoadingSection } from './LoadingSection';

export type LayoutProps = {
	children?: React.ReactNode;
	subheader?: React.ReactNode;
	leftSidebar?: React.ReactNode;
	rightSidebar?: React.ReactNode;
	header: React.FC<HeaderPresentationProps>;
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

export function Layout({
	children,
	subheader,
	leftSidebar,
	rightSidebar,
	header,
}: LayoutProps) {
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
				rootRef={rootRef}
				subheader={subheader}
				leftSidebar={leftSidebar}
				rightSidebar={rightSidebar}
				header={header}
				children={children}
			/>
			<Modals />
		</>
	);
}

export function LayoutPresentation({
	leftSidebar,
	rightSidebar,
	subheader,
	children,
	rootRef,
	header: Header,
}: {
	leftSidebar?: React.ReactNode;
	rightSidebar?: React.ReactNode;
	subheader?: React.ReactNode;
	children?: React.ReactNode;
	rootRef?: React.RefObject<HTMLDivElement>;
	header: React.FC<HeaderPresentationProps>;
}) {
	const leftSidebarRef = useRef<HTMLElement>(null);
	const rightSidebarRef = useRef<HTMLElement>(null);
	return (
		<div
			className={styles.layout}
			data-left-drawer={leftSidebar ? true : false}
			data-right-drawer={rightSidebar ? true : false}
			ref={rootRef}
		>
			<Header className={styles.header}>
				{subheader && (
					<nav className="hidden lg:block max-w-screen-md flex-1 px-4 py-1 bg-slate-100 dark:bg-slate-900 rounded-sm shadow-inner">
						<LoadingSection>{subheader}</LoadingSection>
					</nav>
				)}
			</Header>

			{subheader && (
				<nav
					className={twMerge(
						styles.subheader,
						'lg:hidden bg-slate w-full bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100 shadow-sm flex flex-row items-center gap-2 h-12 p-1',
					)}
				>
					{leftSidebar && (
						<IconButton.Secondary
							className="lg:hidden"
							onClick={() => leftSidebarRef?.current?.focus()}
						>
							<HiOutlineEllipsisVertical className="h-8 w-8" />
						</IconButton.Secondary>
					)}
					<div className="flex-1">
						<LoadingSection>{subheader}</LoadingSection>
					</div>
				</nav>
			)}

			<Sidebar.Left ref={leftSidebarRef}>
				<LoadingSection>{leftSidebar}</LoadingSection>
			</Sidebar.Left>
			<Main className={styles.main}>{children}</Main>
			<Sidebar.Right ref={rightSidebarRef}>
				<LoadingSection>{rightSidebar}</LoadingSection>
			</Sidebar.Right>

			<div className={styles.backdrop}></div>
		</div>
	);
}
