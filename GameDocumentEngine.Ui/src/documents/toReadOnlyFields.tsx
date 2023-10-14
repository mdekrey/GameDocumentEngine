import type { DocumentPointers } from './get-document-pointers';
import type { PerFieldState } from '@/utils/form';
import { defaultField } from '@/utils/form';

export function toReadOnlyFields(
	p: DocumentPointers,
	path = '',
): PerFieldState<boolean> {
	if (p.pointers.length === 0) return true;
	if (p.pointers.length === 1 && p.pointers[0] === '') return false;

	const result: PerFieldState<boolean> & object = Object.fromEntries(
		p
			.topLevelKeys()
			.map((key) => [
				key ?? defaultField,
				toReadOnlyFields(p.navigate(key), `${path}/${key}`),
			]),
	);
	result[defaultField] = !p.contains();
	return result;
}
