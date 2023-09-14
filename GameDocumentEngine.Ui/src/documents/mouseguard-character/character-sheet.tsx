import type { GameObjectWidgetProps, Updater } from '../defineDocument';
import { useCallback, useEffect, useMemo } from 'react';
import { UseFormResult, useForm } from '@/utils/form/useForm';
import type { Character } from './character-types';
import { CharacterDocument } from './character-types';
import { applyPatch, createPatch } from 'rfc6902';
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
import { FormEvents } from '@/utils/form/events/FormEvents';
import { updateFormDefaultMapped } from '@/utils/form/update-form-default';
import { characterFixup } from './fixupCharacter';
import { TabConfig, Tabs } from '@/components/tabs/tabs';
import { Sections, Section, SectionHeader } from '@/components/sections';
import {
	getWritableDocumentPointers,
	DocumentPointers,
	getReadableDocumentPointers,
} from '@/documents/get-document-pointers';
import { toReadOnlyFields } from '@/documents/toReadOnlyFields';

export function FullCharacterSheet({
	document,
	onUpdateDocument,
	translation,
}: GameObjectWidgetProps<Character>) {
	const readablePointers = useMemo(
		() =>
			document.data
				? getReadableDocumentPointers(document.data, characterFixup.toForm)
				: null,
		[document.data],
	);
	const writablePointers = useMemo(
		() =>
			document.data
				? getWritableDocumentPointers(document.data, characterFixup.toForm)
				: null,
		[document.data],
	);
	if (!document.data || !writablePointers || !readablePointers) {
		return 'Loading...';
	}

	const characterData = document.data;

	return (
		<div className="p-4">
			{readablePointers.pointers.length > 0 && (
				<CharacterSheet
					writablePointers={writablePointers}
					character={characterData}
					translation={translation}
					onUpdateDocument={onUpdateDocument}
				/>
			)}
		</div>
	);
}

type TabContent = React.FC<{
	form: UseFormResult<CharacterDocument>;
	translation: GameObjectWidgetProps<CharacterDocument>['translation'];
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
	character,
	writablePointers,
	onUpdateDocument,
	translation: t,
}: {
	character: CharacterDocument;
	writablePointers: DocumentPointers;
	onUpdateDocument: Updater<Character>;
	translation: GameObjectWidgetProps<CharacterDocument>['translation'];
}) {
	const form = useForm({
		defaultValue: characterFixup.toForm(character),
		schema: CharacterDocument,
		translation: (f) => t(`character-sheet.${f}`),
		readOnly: toReadOnlyFields(writablePointers),
	});
	updateFormDefaultMapped(form, character, characterFixup);

	const onSubmit = useCallback(
		async function onSubmit(currentValue: CharacterDocument) {
			const fixedUp = characterFixup.fromForm(currentValue);
			await onUpdateDocument((prev) => {
				const ops = createPatch(
					{
						name: prev.name,
						details: prev.details,
					},
					fixedUp,
				);
				applyPatch(prev, ops);
			});
		},
		[onUpdateDocument],
	);
	useEffect(() => {
		form.formEvents.addEventListener(FormEvents.AnyBlur, submitOnChange);
		return () => {
			form.formEvents.removeEventListener(FormEvents.AnyBlur, submitOnChange);
		};

		function submitOnChange() {
			form.handleSubmit(onSubmit)();
		}
	}, [form, onUpdateDocument, onSubmit]);

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
