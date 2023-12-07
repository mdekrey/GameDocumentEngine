import { twMerge } from 'tailwind-merge';
import type { ButtonTheme } from './buttonThemes';
import type { ThemedTemplateResolver } from '../template';
import { elementTemplate } from '../template';

const buttonTemplate = elementTemplate(
	'Button',
	'button',
	(T) => (
		<T
			type="button"
			className={twMerge(
				'bg-slate-800 text-white focus:bg-slate-700 hover:bg-slate-700 outline-black',
				'dark:bg-slate-100 dark:text-slate-900 dark:focus:bg-slate-200 dark:hover:bg-slate-200 dark:outline-white',
				'px-3 py-2 rounded-md',
				'w-full sm:w-auto',
				'inline-flex items-center justify-center',
				'text-sm font-semibold',
				'transition-colors shadow-sm',
			)}
		/>
	),
	{
		mutateProps: ({ className, disabled, ...rest }) => ({
			disabled: false,
			className: twMerge(disabled && 'opacity-20', className),
			...rest,
		}),
	},
);

export const defaultButtonThemes: ThemedTemplateResolver<
	ButtonTheme,
	React.FC<{ className: string }>
> = {
	Destructive: (T) => (
		<T className="bg-red-600 text-white focus:bg-red-500 hover:bg-red-500 dark:bg-red-600 dark:text-white dark:focus:bg-red-700 dark:hover:bg-red-700" />
	),
	Save: (T) => (
		<T className="bg-green-600 text-white focus:bg-green-500 hover:bg-green-500 dark:bg-green-600 dark:text-white dark:focus:bg-green-500 dark:hover:bg-green-500" />
	),
	Secondary: (T) => (
		<T className="bg-slate-100 text-slate-900 focus:bg-slate-50 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-950 dark:hover:bg-slate-950" />
	),
	DestructiveSecondary: (T) => (
		<T className="bg-red-100 text-red-700 focus:bg-red-200 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:focus:bg-red-700 dark:hover:bg-red-700" />
	),
};

export const Button = buttonTemplate.themed(defaultButtonThemes);
