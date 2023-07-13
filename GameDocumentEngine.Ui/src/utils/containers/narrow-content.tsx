export function NarrowContent({ children }: { children?: React.ReactNode }) {
	return (
		<div className="w-full h-full bg-gray-200">
			<div className="max-w-screen-sm m-auto flex flex-col bg-white h-full p-6">
				{children}
			</div>
		</div>
	);
}
