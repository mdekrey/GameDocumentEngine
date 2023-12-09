import type { GameObjectComponentBase } from '@/documents/defineDocument';
import type { Character } from '../character-types';

export function CombatStats({ document }: GameObjectComponentBase<Character>) {
	return <>{document.name}</>;
}
