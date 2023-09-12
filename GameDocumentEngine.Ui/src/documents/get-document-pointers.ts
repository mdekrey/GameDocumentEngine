import { writeDocumentDetailsPrefix } from '@/utils/security/permission-strings';
import { matchingPermissionParams } from '@/utils/security/get-permissions-params';
import { JSONPath } from 'jsonpath-plus';
import {
	EditableDocumentDetails,
	TypedDocumentDetails,
} from '@/documents/defineDocument';

export type DocumentPointers = {
	pointers: string[];
	topLevelKeys(): Array<string | number>;
	contains(...steps: Array<string | number>): boolean;
	navigate(
		step: string | number,
		...steps: Array<string | number>
	): DocumentPointers;
};

export function getWritableDocumentPointers<T>(
	target: TypedDocumentDetails<T>,
	fixup?: (
		networkValue: EditableDocumentDetails<T>,
	) => EditableDocumentDetails<T>,
): DocumentPointers {
	let editableTarget: EditableDocumentDetails<T> = {
		name: target.name,
		details: target.details,
	};
	if (fixup) editableTarget = fixup(editableTarget);
	const pointers = matchingPermissionParams(
		target.permissions,
		writeDocumentDetailsPrefix(target.gameId, target.id),
	).flatMap((path) => {
		const result = JSONPath<string[]>({
			path,
			json: editableTarget,
			resultType: 'pointer',
			preventEval: true,
		});
		return result;
	});

	return buildDocumentPointers(pointers);

	function buildDocumentPointers(pointers: string[]): DocumentPointers {
		return {
			pointers,
			topLevelKeys() {
				return [...new Set(pointers.map((v) => v.split('/')[1]))];
			},
			contains(...steps) {
				const prefix = steps.map((s) => `/${s}`).join('');
				return pointers.includes(prefix);
			},
			navigate(...steps) {
				const prefix = steps.map((s) => `/${s}`).join('');
				return buildDocumentPointers(
					pointers
						.filter((p) => p.startsWith(prefix))
						.map((p) => p.substring(prefix.length)),
				);
			},
		};
	}
}
