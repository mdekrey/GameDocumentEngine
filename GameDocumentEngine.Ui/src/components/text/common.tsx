import { elementTemplate } from '../template';

export const Prose = elementTemplate<'p'>(
	'Prose',
	<p className="text-sm text-slate-700 dark:text-slate-300" />,
);
