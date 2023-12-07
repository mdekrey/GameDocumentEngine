import { elementTemplate } from '../template';

export const ButtonRow = elementTemplate('ButtonRow', 'div', (T) => (
	<T className="flex flex-row-reverse gap-2" />
));
