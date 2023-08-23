import type { Operation } from 'rfc6902';
import type { Patch } from 'immer';

export function immerPatchToStandard(immerChange: Patch): Operation {
	return {
		op: immerChange.op,
		path: '/' + immerChange.path.join('/'),
		value: immerChange.value as unknown,
	};
}
