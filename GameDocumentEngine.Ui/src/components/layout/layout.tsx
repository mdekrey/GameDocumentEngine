import { Header } from '../header/header';
import { Modals } from '@/utils/modal/modal-service';
import { useNetworkIndicator } from '../network/useNetworkIndicator';
import { useHeader } from '../header/useHeaderMenuItems';

export type LayoutProps = { children?: React.ReactNode };

export function Layout({ children }: LayoutProps) {
	const networkIndicator = useNetworkIndicator();
	const header = useHeader();

	return (
		<div className="w-full h-full flex flex-col">
			<Header {...networkIndicator} {...header} />
			<main className="overflow-auto flex-1 bg-layout-empty text-white">
				{children}
			</main>
			<Modals />
		</div>
	);
}
