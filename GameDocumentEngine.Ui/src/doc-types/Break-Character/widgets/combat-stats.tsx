import type {
	GameObjectComponentBase,
	GameObjectWidgetDefinition,
} from '@/documents/defineDocument';
import type { Character } from '../character-types';
import { LuShield, LuSword } from 'react-icons/lu';
import { HiHeart } from 'react-icons/hi2';
import { GiRun } from 'react-icons/gi';
import { elementTemplate } from '@/components/template';
import { ErrorScreen } from '@/components/errors';

const asModifier = new Intl.NumberFormat('en', {
	signDisplay: 'always',
	maximumFractionDigits: 0,
});

const Section = elementTemplate('Section', 'div', (T) => (
	<T className="flex flex-col justify-center items-center" />
));
const FirstRow = elementTemplate('FirstRow', 'div', (T) => (
	<T className="flex flex-row gap-0.5 items-center leading-4 font-bold" />
));
const SecondRow = elementTemplate('SecondRow', 'div', (T) => (
	<T className="uppercase text-xs tracking-widest" />
));

export function CombatStats({
	document,
	translation: t,
}: GameObjectComponentBase<Character>) {
	if (!document.details.combatValues) {
		return <ErrorScreen.NoAccess.Sized size="widget" />;
	}
	return (
		<div className="grid gap-2 grid-cols-[1fr,auto,1fr] grid-rows-[1fr,auto,1fr] h-full w-full">
			<Section>
				<FirstRow>
					<LuSword />
					{asModifier.format(document.details.combatValues.attack.attackBonus)}
				</FirstRow>
				<SecondRow>{t('sections.attack')}</SecondRow>
			</Section>
			<div className="border-l" />
			<Section>
				<FirstRow>
					<HiHeart />
					{document.details.combatValues.hearts.total}
				</FirstRow>
				<SecondRow>{t('sections.hearts')}</SecondRow>
			</Section>
			<div className="border-t col-span-3" />
			<Section>
				<FirstRow>
					<LuShield />
					{document.details.combatValues.defense.total}
				</FirstRow>
				<SecondRow>{t('sections.defense')}</SecondRow>
			</Section>
			<div className="border-l" />
			<Section>
				<FirstRow>
					<GiRun />
					<span className="text-xs">
						{t(`speed.${document.details.combatValues.speed.actual}`)}
					</span>
				</FirstRow>
				<SecondRow>{t('sections.speed')}</SecondRow>
			</Section>
		</div>
	);
}

export const CombatStatsWidgetDefinition: GameObjectWidgetDefinition<Character> =
	{
		component: CombatStats,
		defaults: { width: 10, height: 5 },
		translationKeyPrefix: 'widgets.CombatStats',
		getConstraints() {
			return { min: { width: 9, height: 5 } };
		},
	};
