import { z } from 'zod';
import { GameObjectWidgetProps } from '../defineDocument';
import characterSchema from './schema-improved';
import { useDebugValue } from 'react';

export function CharacterSheet({
	document,
	onDeleteDocument,
	onUpdateDocument,
	translation: t,
}: GameObjectWidgetProps<z.infer<typeof characterSchema>>) {
	useDebugValue(document);
	useDebugValue(onDeleteDocument);
	useDebugValue(onUpdateDocument);
	useDebugValue(t);
	return null;
}
