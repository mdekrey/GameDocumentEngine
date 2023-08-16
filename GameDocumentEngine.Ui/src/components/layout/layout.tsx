import { Header, HeaderProps } from '../header/header';
import { Modals } from '@/utils/modal/modal-service';
import { NetworkIndicatorProps } from '../network/network-indicator';
import styles from './layout.module.css';
import {
	useAsAtom,
	useComputedAtom,
} from '@principlestudios/jotai-react-signals';
import { JotaiDiv } from '../form-fields/jotai/div';

export type LayoutProps = { children?: React.ReactNode } & HeaderProps &
	NetworkIndicatorProps;

export function Layout({
	children,
	menuItems,
	user,
	connectionState,
	onReconnect,
}: LayoutProps) {
	const showLeftDrawer = useAsAtom(true);
	const leftDrawer = useComputedAtom((get) =>
		get(showLeftDrawer) ? 'true' : 'false',
	);
	const showRightDrawer = useAsAtom(true);
	const rightDrawer = useComputedAtom((get) =>
		get(showRightDrawer) ? 'true' : 'false',
	);
	return (
		<JotaiDiv
			className={styles.layout}
			data-left-drawer={leftDrawer}
			data-right-drawer={rightDrawer}
		>
			<Header
				menuItems={menuItems}
				user={user}
				connectionState={connectionState}
				onReconnect={onReconnect}
				className={styles.header}
			/>
			<section className={styles['sidebar-left']}></section>
			<main className={styles.main}>{children}</main>
			<section className={styles['sidebar-right']}></section>
			<Modals />
		</JotaiDiv>
	);
}
