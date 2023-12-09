import { buildTheme } from '../template';

/**
 * A default set of themes for buttons of all underlying types. Changes
 * background colors, text, hover states, and supports dark mode.
 **/
export const defaultButtonThemes = buildTheme({
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

export type ButtonTheme = keyof typeof defaultButtonThemes;
export const buttonThemeNames = Object.keys(
	defaultButtonThemes,
) as ReadonlyArray<ButtonTheme>;
