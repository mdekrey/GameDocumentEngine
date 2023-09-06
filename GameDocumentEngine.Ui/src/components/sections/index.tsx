import { Prose } from '../text/common';
import { elementTemplate } from '../template';

export const Sections = elementTemplate<'div'>(
	'Sections',
	<div className="flex flex-col divide-y" />,
);

export const SingleColumnSections = Sections.extend(
	'SingleColumnSections',
	<div className="max-w-sm m-auto" />,
);

export const Section = elementTemplate<'section'>(
	'Section',
	<section className="py-4" />,
);

export const SectionHeader = Prose.extend(
	'SectionHeader',
	<h2 className="text-xl font-bold mb-4 border-slate-700 dark:border-slate-300" />,
	{ overrideType: true },
);
