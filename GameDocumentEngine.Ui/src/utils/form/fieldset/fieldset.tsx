export function Fieldset({ children }: { children: React.ReactNode }) {
	return (
		<div className="m-auto max-w-screen-sm flex flex-col md:grid md:grid-cols-[minmax(auto,20%)_1fr] gap-2">
			{children}
		</div>
	);
}
