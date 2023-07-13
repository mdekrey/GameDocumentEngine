import { withSlots } from 'react-slot-component';
import { Header } from '../header/header';

export type LayoutProps = { children?: React.ReactNode };

export type LayoutSlots = {
	Sidebar: {
		children?: React.ReactNode;
	};
};

export const Layout = withSlots<LayoutSlots, LayoutProps>(
	({ children, slotProps }) => {
		return (
			<div className="w-full h-full flex flex-col md:flex-row">
				<Header>{slotProps.Sidebar?.children}</Header>
				<main className="overflow-auto flex-1">{children}</main>
			</div>
		);
	},
);
Layout.displayName = 'Layout';
