import { twMerge } from 'tailwind-merge';

function mergeButton<TProps extends { className?: string | undefined }>(
	component: React.ComponentType<TProps>,
	name: string,
	themeClassName: string,
) {
	// TODO: Research: why does this need to be cast?
	const Component = component as React.ComponentType<
		{ className: string } & Omit<TProps, 'className'>
	>;
	const result: React.FC<TProps> = ({ className, ...props }) => (
		<Component className={twMerge(themeClassName, className)} {...props} />
	);
	result.displayName = name;
	return result;
}

const destructive = (
	(
		<a className="bg-red-600 text-white focus:bg-red-500 hover:bg-red-500 outline-black" />
	).props as JSX.IntrinsicElements['a']
).className as string;

const save = (
	(
		<a className="bg-green-600 text-white focus:bg-green-500 hover:bg-green-500 outline-black" />
	).props as JSX.IntrinsicElements['a']
).className as string;

const secondary = (
	(
		<a className="bg-white text-gray-900 focus:bg-gray-50 hover:bg-gray-50 outline-gray-300" />
	).props as JSX.IntrinsicElements['a']
).className as string;

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
