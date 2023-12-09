import type { TemplateResolver } from '../template';
import { disabledButtonTemplate } from './button';
import { defaultButtonThemes } from './buttonThemes';

export const iconButtonTheme: TemplateResolver<{ className: string }> = (T) => (
	<T className="p-1 text-xl rounded-full flex items-center bg-slate-800 text-white font-bold focus:bg-slate-700 hover:bg-slate-700 outline-blue-700 transition-colors self-center" />
);

const buttonTemplate = disabledButtonTemplate.extend(
	'IconButton',
	iconButtonTheme,
);

export const IconButton = buttonTemplate.themed(defaultButtonThemes);
