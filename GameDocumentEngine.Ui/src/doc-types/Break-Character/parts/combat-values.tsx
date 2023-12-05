import type { Character } from '../character-types';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import { Attack } from './combat/attack';
import { Hearts } from './combat/hearts';
import { Defense } from './combat/defense';
import { Speed } from './combat/speed';

export function CombatValues({ form }: GameObjectFormComponent<Character>) {
	return (
		<div className="flex flex-col md:grid md:grid-cols-2 gap-y-4">
			<div className="md:pr-4 md:border-r">
				<Attack form={form} />
			</div>
			<div className="md:pl-4">
				<Hearts form={form} />
			</div>
			<div className="md:pr-4 md:border-r">
				<Defense form={form} />
			</div>
			<div className="md:pl-4">
				<Speed form={form} />
			</div>
		</div>
	);
}
