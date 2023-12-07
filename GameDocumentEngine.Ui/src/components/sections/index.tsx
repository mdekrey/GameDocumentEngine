import { Prose } from '../text/common';
import { elementTemplate } from '../template';

export const Sections = elementTemplate('Sections', 'div', (T) => (
	<T className="flex flex-col divide-y" />
));

export const SingleColumnSections = Sections.extend(
	'SingleColumnSections',
	(T) => <T className="max-w-sm m-auto" />,
);

export const Section = elementTemplate('Section', 'section', (T) => (
	<T className="py-4" />
));

export const SectionHeader = Prose.extend('SectionHeader', () => (
	<h2 className="text-xl font-bold mb-4 border-slate-700 dark:border-slate-300" />
));
