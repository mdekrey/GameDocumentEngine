import { Patch } from 'rfc6902';

export type EntityChangedProps<TKey = unknown, TEntity = unknown> = {
	messageId: string;
	key: TKey;
} & {
	add: { value: TEntity };
	update: { patch: Patch };
	delete: { removed: true };
}['add' | 'update' | 'delete'];
