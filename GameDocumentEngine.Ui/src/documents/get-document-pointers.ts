import {
	readDocumentDetailsPrefix,
	writeDocumentDetailsPrefix,
} from '@/utils/security/permission-strings';
import { matchingPermissionParams } from '@/utils/security/get-permissions-params';
import { JSONPath } from 'jsonpath-plus';
import type {
	EditableDocumentDetails,
	TypedDocumentDetails,
} from '@/documents/defineDocument';
import type { FieldMapping } from '@/utils/form';

export type DocumentPointers = {
	pointers: string[];
	topLevelKeys(): Array<string | number>;
	contains(...steps: Array<string | number>): boolean;
	navigate(
		step: string | number,
		...steps: Array<string | number>
	): DocumentPointers;
};

export function toEditableDetails<T>(
	target: TypedDocumentDetails<T>,
	fixup?: FieldMapping<EditableDocumentDetails<T>, EditableDocumentDetails<T>>,
) {
	let editableTarget: EditableDocumentDetails<T> = {
		name: target.name,
		details: target.details,
	};
	if (fixup) editableTarget = fixup.toForm(editableTarget);
	return {
		document: target,
		editable: editableTarget,
		writablePointers: getWritableDocumentPointers(target, editableTarget),
		readablePointers: getReadableDocumentPointers(target, editableTarget),
	};
}

export function toEditable<T>(
	target: TypedDocumentDetails<T>,
	fixup?: FieldMapping<EditableDocumentDetails<T>, EditableDocumentDetails<T>>,
) {
	let editableTarget: EditableDocumentDetails<T> = {
		name: target.name,
		details: target.details,
	};
	if (fixup) editableTarget = fixup.toForm(editableTarget);
	return editableTarget;
}

type DocumentTarget<T> = Pick<
	TypedDocumentDetails<T>,
	'id' | 'gameId' | 'permissions'
>;

export function getWritableDocumentPointers<T>(
	target: DocumentTarget<T>,
	editableTarget: EditableDocumentDetails<T>,
): DocumentPointers {
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
}

export function getReadableDocumentPointers<T>(
	target: DocumentTarget<T>,
	editableTarget: EditableDocumentDetails<T>,
): DocumentPointers {
	const pointers = matchingPermissionParams(
		target.permissions,
		readDocumentDetailsPrefix(target.gameId, target.id),
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
}

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
					.filter((p) => p.startsWith(prefix + '/') || p === prefix)
					.map((p) => p.substring(prefix.length)),
			);
		},
	};
}
