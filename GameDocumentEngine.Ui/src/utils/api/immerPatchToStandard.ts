import { Operation } from 'rfc6902';

export function immerPatchToStandard(
	immerChange: import('immer').Patch,
): Operation {
	return {
		op: immerChange.op,
		path: '/' + immerChange.path.join('/'),
		value: immerChange.value as unknown,
	};
}
