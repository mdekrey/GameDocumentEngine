import { elementTemplate } from '@/components/template';
import { Prose } from '@/components/text/common';

export const Container = elementTemplate<'div'>(
	'Container',
	<div className="" />,
);

export const CardTitle = Prose.extend(
	'CardTitle',
	<h2 className="text-xl font-bold mb-4 border-slate-700 dark:border-slate-300" />,
	{ overrideType: true },
);

export const CardHint = Prose.extend('CardHint', <p className="" />);
