import type { GameObjectFormComponent } from '@/documents/defineDocument';
import { useMemo } from 'react';
import type { UseFormResult } from '@/utils/form';
import type { Character } from './character-types';
import type { CharacterDocument } from './character-types';
import {
	HiOutlineUser,
	HiOutlineHeart,
	HiOutlineListBullet,
	HiOutlineAcademicCap,
} from 'react-icons/hi2';
import { Bio } from './parts/bio';
import { Personality } from './parts/personality';
import { Notes } from './parts/notes';
import { Abilities } from './parts/abilities';
import { Wises } from './parts/wises';
import { Skills } from './parts/skills';
import { Traits } from './parts/traits';
import { Rewards } from './parts/rewards';
import { Conditions } from './parts/conditions';
import type { TabConfig } from '@/components/tabs/tabs';
import { Tabs } from '@/components/tabs/tabs';
import { Sections, Section, SectionHeader } from '@/components/sections';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import type { TFunction } from 'i18next';
import { useTranslationForDocument } from '@/utils/api/hooks';

type TabContent = React.FC<{
	form: UseFormResult<CharacterDocument>;
	translation: TFunction;
}>;
const BioTab: TabContent = ({ form, translation: t }) => (
	<>
		<Section>
			<SectionHeader>{t('character-sheet.headers.bio')}</SectionHeader>
			<Bio form={form} />
		</Section>
		<Section>
			<SectionHeader>{t('character-sheet.headers.notes')}</SectionHeader>
			<Notes form={form} />
		</Section>
	</>
);
const PersonalityTab: TabContent = ({ form, translation: t }) => {
	return (
		<>
			<Section>
				<SectionHeader>
					{t('character-sheet.headers.personality')}
				</SectionHeader>
				<Personality form={form} />
			</Section>
			<Section>
				<SectionHeader>{t('character-sheet.headers.wises')}</SectionHeader>
				<Wises form={form} />
			</Section>
			<Section>
				<SectionHeader>{t('character-sheet.headers.traits')}</SectionHeader>
				<Traits form={form} />
			</Section>
		</>
	);
};
const AbilitiesTab: TabContent = ({ form, translation: t }) => {
	return (
		<Sections>
			<Section>
				<SectionHeader>{t('character-sheet.headers.abilities')}</SectionHeader>
				<Abilities form={form} />
			</Section>
			<Section>
				<SectionHeader>{t('character-sheet.headers.skills')}</SectionHeader>
				<Skills form={form} />
			</Section>
		</Sections>
	);
};
const StatusTab: TabContent = ({ form, translation: t }) => {
	return (
		<Sections className="md:grid md:grid-cols-2 gap-2">
			<Section>
				<SectionHeader>{t('character-sheet.headers.rewards')}</SectionHeader>
				<Rewards form={form} />
			</Section>
			<Section>
				<SectionHeader>{t('character-sheet.headers.conditions')}</SectionHeader>
				<Conditions form={form} />
			</Section>
		</Sections>
	);
};

const tabInfo: [id: string, icon: typeof HiOutlineUser, content: TabContent][] =
	[
		['bio', HiOutlineUser, BioTab],
		['personality', HiOutlineHeart, PersonalityTab],
		['abilities', HiOutlineAcademicCap, AbilitiesTab],
		['status', HiOutlineListBullet, StatusTab],
	];

export function CharacterSheet({
	form,
	document,
	onSubmit,
}: GameObjectFormComponent<Character>) {
	const t = useTranslationForDocument(document);
	useSubmitOnChange(form, onSubmit);

	const tabs = useMemo(
		(): TabConfig[] =>
			tabInfo.map(([key, icon, Component]) => ({
				key,
				icon,
				title: t(`character-sheet.tabs.${key}`),
				content: <Component form={form} translation={t} />,
			})),
		[form, t],
	);

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="flex flex-col gap-2"
		>
			<Tabs tabs={tabs} />
		</form>
	);
}
