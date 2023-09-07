import { elementTemplate } from '../template';

export const Prose = elementTemplate<'p'>(
	'Prose',
	<p className="text-sm text-slate-700 dark:text-slate-300" />,
);

export const IntroText = elementTemplate<'p'>(
	'IntroText',
	<p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-cursive" />,
);
