import { elementTemplate } from '../template';

export const Prose = elementTemplate('Prose', 'p', (T) => (
	<T className="text-sm text-slate-700 dark:text-slate-300" />
));

export const IntroText = elementTemplate('IntroText', 'p', (T) => (
	<T className="text-2xl text-slate-900 dark:text-slate-100 font-handwriting" />
));
