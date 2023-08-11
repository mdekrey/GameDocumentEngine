import { withSlots } from 'react-slot-component';
import { Header, MenuTab } from '../header/header';
import { Modals } from '@/utils/modal/modal-service';

export type LayoutProps = { children?: React.ReactNode };

export type LayoutSlots = {
	MenuTabs: {
		mainItem: MenuTab;
		items: MenuTab[];
	};
};

export const Layout = withSlots<LayoutSlots, LayoutProps>(
	({ children, slotProps }) => {
		return (
			<div className="w-full h-full flex flex-col">
				<Header
					mainItem={slotProps.MenuTabs?.mainItem}
					menuTabs={slotProps.MenuTabs?.items}
				/>
				<main className="overflow-auto flex-1">{children}</main>
				<Modals />
			</div>
		);
	},
);
Layout.displayName = 'Layout';
