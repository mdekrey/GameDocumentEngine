import { withSlots } from 'react-slot-component';
import { HeaderContainer } from '../header/header.container';
import { Modals } from '@/utils/modal/modal-service';
import { MenuTab } from '../header/header';

export type LayoutProps = { children?: React.ReactNode };

export type LayoutSlots = {
	MenuTabs: {
		mainItem: MenuTab;
	};
};

export const Layout = withSlots<LayoutSlots, LayoutProps>(
	({ children, slotProps }) => {
		return (
			<div className="w-full h-full flex flex-col">
				<HeaderContainer mainItem={slotProps.MenuTabs?.mainItem} />
				<main className="overflow-auto flex-1 bg-layout-empty text-white">
					{children}
				</main>
				<Modals />
			</div>
		);
	},
);
Layout.displayName = 'Layout';
