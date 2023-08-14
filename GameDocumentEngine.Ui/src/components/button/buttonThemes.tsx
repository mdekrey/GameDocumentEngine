import { twMerge } from 'tailwind-merge';

function mergeButton<TProps extends { className?: string | undefined }>(
	Component: React.ComponentType<TProps>,
	name: string,
	themeClassName: string,
) {
	const result: React.FC<TProps> = ({ ...props }) => (
		<Component
			{...props}
			className={twMerge(themeClassName, props.className)}
		/>
	);
	result.displayName = name;
	return result;
}

function toClassName(elem: JSX.Element) {
	return (
		(elem.props as JSX.IntrinsicElements[keyof JSX.IntrinsicElements])
			.className ?? ''
	);
}

const destructive = toClassName(
	<a className="bg-red-600 text-white focus:bg-red-500 hover:bg-red-500 outline-black" />,
);

const save = toClassName(
	<a className="bg-green-600 text-white focus:bg-green-500 hover:bg-green-500 outline-black" />,
);

const secondary = toClassName(
	<a className="bg-white text-gray-900 focus:bg-gray-50 hover:bg-gray-50 outline-gray-300" />,
);

const destructiveSecondary = toClassName(
	<a className="bg-red-100 text-red-700 focus:bg-red-200 hover:bg-gray-200 outline-red-700" />,
);

export function buttonThemes<TProps extends { className?: string | undefined }>(
	nameSuffix: string,
	Component: React.ComponentType<TProps>,
) {
	return {
		Destructive: mergeButton(
			Component,
			`Destructive${nameSuffix}`,
			destructive,
		),
		Save: mergeButton(Component, `Save${nameSuffix}`, save),
		Secondary: mergeButton(Component, `Secondary${nameSuffix}`, secondary),
		DestructiveSecondary: mergeButton(
			Component,
			`DestructiveSecondary${nameSuffix}`,
			destructiveSecondary,
		),
	};
}

export const iconButtonClasses =
	'p-1 text-xl rounded-full flex items-center bg-slate-800 text-white font-bold focus:bg-slate-700 hover:bg-slate-700 outline-blue-700 transition-colors self-center';
export const buttonClasses = twMerge(
	'bg-slate-800 text-white focus:bg-slate-700 hover:bg-slate-700 outline-blue-700',
	'px-3 py-2 rounded-md',
	'w-full sm:w-auto',
	'inline-flex items-center justify-center',
	'text-sm font-semibold',
	'transition-colors shadow-sm',
);
