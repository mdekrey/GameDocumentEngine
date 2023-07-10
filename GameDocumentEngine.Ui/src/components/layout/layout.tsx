import { Header } from '../header/header';

export function Layout({ children }: { children?: React.ReactNode }) {
	return (
		<div className="w-full h-full flex flex-col md:flex-row">
			<Header />
			<div className="overflow-auto flex-1">{children}</div>
		</div>
	);
}
