import type { Character } from '../character-types';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import { Attack } from './combat/attack';
import { Hearts } from './combat/hearts';
import { Defense } from './combat/defense';
import { Speed } from './combat/speed';

export function CombatValues({ form }: GameObjectFormComponent<Character>) {
	return (
		<div className="flex flex-col md:grid md:grid-cols-2 gap-4">
			<Attack form={form} />
			<Hearts form={form} />
			<Defense form={form} />
			<Speed form={form} />
		</div>
	);
}
