import { twMerge } from 'tailwind-merge';
import type { ButtonTheme } from './buttonThemes';
import { buildTheme, elementTemplate } from '../template';

/** Not intended for use as a component (though it could be), this is intended
 * more as a template for a base `button` that moves the "disabled"
 * functionality to a more appropriate location and applies a base style. */
export const disabledButtonTemplate = elementTemplate(
	'disabledButton',
	'button',
	(T) => <T type="button" />,
	{
		mutateProps: ({ className, disabled, ...rest }) => ({
			disabled: false,
			className: twMerge(disabled && 'opacity-20', className),
			...rest,
		}),
	},
);

/**
 * A default set of themes for buttons of all underlying types. Changes
 * background colors, text, hover states, and supports dark mode.
 **/
export const defaultButtonThemes = buildTheme<ButtonTheme>({
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
});

export const Button = disabledButtonTemplate
	.extend('Button', (T) => (
		<T
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
	))
	.themed(defaultButtonThemes);
