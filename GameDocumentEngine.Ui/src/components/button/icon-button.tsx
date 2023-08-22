import { twMerge } from 'tailwind-merge';
import { defaultButtonThemes } from './button';
import { elementTemplate } from '../template';

export const iconButtonClasses =
	'p-1 text-xl rounded-full flex items-center bg-slate-800 text-white font-bold focus:bg-slate-700 hover:bg-slate-700 outline-blue-700 transition-colors self-center';

const buttonTemplate = elementTemplate<'button'>(
	'IconButton',
	<button type="button" className={twMerge(iconButtonClasses)} />,
	{
		mutateProps: ({ className, disabled }) => ({
			disabled: false,
			className: twMerge(disabled && 'opacity-20', className),
		}),
	},
);

export const IconButton = buttonTemplate.themed(defaultButtonThemes);
