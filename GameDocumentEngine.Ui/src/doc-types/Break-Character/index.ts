import { GiPawn } from 'react-icons/gi';
import { defineDocument } from '@/documents/defineDocument';
import { CharacterSheet } from './character-sheet';
import schema from './schema';
import type { z } from 'zod';
import { characterFixup } from './fixupCharacter';
import { CombatStats } from './widgets/combat-stats';
import { NamedIconWidget } from '@/components/named-icon/named-icon-widget';

const template: z.infer<typeof schema> = {
	identity: {},
	aptitudes: {
		might: {
			base: 6,
			trait: 0,
			total: 6,
			modifiers: '',
		},
		deftness: {
			base: 6,
			trait: 0,
			total: 6,
			modifiers: '',
		},
		grit: {
			base: 6,
			trait: 0,
			total: 6,
			modifiers: '',
		},
		insight: {
			base: 6,
			trait: 0,
			total: 6,
			modifiers: '',
		},
		aura: {
			base: 6,
			trait: 0,
			total: 6,
			modifiers: '',
		},
	},
	combatValues: {
		attack: {
			attackBonus: 0,
			weapons: [],
		},
		hearts: {
			base: 0,
			current: 0,
			modifiers: '',
			total: 0,
			injuries: '',
		},
		defense: {
			base: 0,
			modifiers: '',
			total: 0,
		},
		speed: {
			base: 'average',
			modifiers: '',
			actual: 'average',
		},
	},
	quirk: '',
	abilities: [],
	gear: {
		worn: '',
		slotsBase: 0,
		slotsTotal: 0,
		slotsModifiers: '',
		inventory: [],
	},
	social: '',
	allegience: {
		darkPoints: 0,
		brightPoints: 0,
		gifts: '',
	},
	wealth: {
		stones: 0,
		coins: 0,
		gems: 0,
	},
	xp: {
		current: 0,
		nextRank: 0,
	},
};

defineDocument('Break-Character', {
	icon: GiPawn,
	template,
	component: CharacterSheet,
	schema,
	fixup: characterFixup,
	widgets: {
		Name: {
			component: NamedIconWidget,
			defaults: { width: 10, height: 2 },
			translationNamespace: 'widgets/name',
			translation: '',
		},
		CombatStats: {
			component: CombatStats,
			defaults: { width: 10, height: 5 },
			translation: 'widgets.CombatStats',
		},
	},
});
