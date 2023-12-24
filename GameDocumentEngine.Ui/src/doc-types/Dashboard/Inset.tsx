import { JotaiDiv } from '@/components/jotai/div';
import { elementTemplate } from '@/components/template';

export const Inset = elementTemplate('Inset', JotaiDiv, (T) => (
	<T className="absolute inset-0" />
));

export const LimitingInset = Inset.extend('LimitingInset', (T) => (
	<T className="overflow-hidden" />
));
