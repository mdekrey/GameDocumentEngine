import { Patch } from 'rfc6902';

export type EntityChangedProps<TKey = unknown, TEntity = unknown> = {
	messageId: string;
	key: TKey;
} & {
	add: { initialValue: TEntity };
	update: { patch: Patch };
	delete: object;
}['add' | 'update' | 'delete'];
