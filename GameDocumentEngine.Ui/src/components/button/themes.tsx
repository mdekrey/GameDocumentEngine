export const destructive = (
	(<a className="bg-red-800 focus:bg-red-700 hover:bg-red-700 outline-black" />)
		.props as JSX.IntrinsicElements['a']
).className as string;

export const save = (
	(
		<a className="bg-green-800 focus:bg-green-700 hover:bg-green-700 outline-black" />
	).props as JSX.IntrinsicElements['a']
).className as string;
