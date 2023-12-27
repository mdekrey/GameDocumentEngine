import type {
	GameObjectWidgetDefinition,
	WidgetComponentProps,
	WidgetSettingsComponentProps,
} from '@/documents/defineDocument';
import type { Character } from '../character-types';
import { LuShield, LuSword } from 'react-icons/lu';
import { HiHeart } from 'react-icons/hi2';
import { GiRun } from 'react-icons/gi';
import { elementTemplate } from '@/components/template';
import { ErrorScreen } from '@/components/errors';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { SelectField } from '@/components/form-fields/select-input/select-field';
import { z } from 'zod';
import { useTranslationForDocument } from '@/utils/api/hooks';
import { Link } from 'react-router-dom';

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

const styles: Record<
	'vertical' | 'horizontal' | '2x2',
	Record<'container' | 'edge' | 'middle', string>
> = {
	horizontal: {
		container: 'flex flex-row gap-2 h-full w-full justify-around',
		edge: 'border-l',
		middle: 'border-l',
	},
	vertical: {
		container: 'flex flex-col gap-2 h-full w-full justify-around',
		edge: 'border-t',
		middle: 'border-t',
	},
	'2x2': {
		container:
			'grid grid-cols-[1fr,auto,1fr] grid-rows-[1fr,auto,1fr] gap-2 h-full w-full',
		edge: 'border-l',
		middle: 'border-t col-span-3',
	},
};

export function CombatStats({
	document,
	widgetType,
	widgetSettings,
}: WidgetComponentProps<Character, CombatStatsSettings>) {
	const t = useTranslationForDocument(document, widgetType);
	if (!document.details.combatValues) {
		return <ErrorScreen.NoAccess.Sized size="widget" />;
	}
	const { container, edge, middle } = styles[widgetSettings.mode ?? '2x2'];
	const path = `/game/${document.gameId}/document/${document.id}/combat`;
	return (
		<Link to={path} className={container}>
			<Section>
				<FirstRow>
					<LuSword />
					{asModifier.format(document.details.combatValues.attack.attackBonus)}
				</FirstRow>
				<SecondRow>{t('sections.attack')}</SecondRow>
			</Section>
			<div className={edge} />
			<Section>
				<FirstRow>
					<HiHeart />
					{document.details.combatValues.hearts.total}
				</FirstRow>
				<SecondRow>{t('sections.hearts')}</SecondRow>
			</Section>
			<div className={middle} />
			<Section>
				<FirstRow>
					<LuShield />
					{document.details.combatValues.defense.total}
				</FirstRow>
				<SecondRow>{t('sections.defense')}</SecondRow>
			</Section>
			<div className={edge} />
			<Section>
				<FirstRow>
					<GiRun />
					<span className="text-xs">
						{t(`speed.${document.details.combatValues.speed.actual}`)}
					</span>
				</FirstRow>
				<SecondRow>{t('sections.speed')}</SecondRow>
			</Section>
		</Link>
	);
}

const modes: Array<CombatStatsSettings['mode']> = [
	undefined,
	'vertical',
	'horizontal',
];
function CombatStatsSettings({
	field,
}: WidgetSettingsComponentProps<Character, CombatStatsSettings>) {
	const fields = useFormFields(field, { mode: ['mode'] as const });
	return (
		<SelectField field={fields.mode} items={modes}>
			{(mode) => fields.mode.translation(mode ?? '2x2')}
		</SelectField>
	);
}

type CombatStatsSettings = { mode?: 'vertical' | 'horizontal' };
export const CombatStatsWidgetDefinition: GameObjectWidgetDefinition<
	Character,
	CombatStatsSettings
> = {
	component: CombatStats,
	defaults: { width: 10, height: 5 },
	translationKeyPrefix: 'widgets.CombatStats',
	getConstraints(settings) {
		return settings.mode === 'horizontal'
			? { min: { width: 17, height: 2 } }
			: settings.mode === 'vertical'
			? { min: { width: 4, height: 11 } }
			: { min: { width: 9, height: 5 } };
	},
	settings: {
		schema: z.object({
			mode: z.enum(['vertical', 'horizontal']).optional(),
		}),
		component: CombatStatsSettings,
		default: {},
	},
};
