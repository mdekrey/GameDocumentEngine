import type { GameObjectWidgetProps, Updater } from '../defineDocument';
import { useCallback, useEffect, useMemo } from 'react';
import { UseFormResult, useForm } from '@/utils/form/useForm';
import type { Character } from './character-types';
import { CharacterDocument } from './character-types';
import { applyPatch, createPatch } from 'rfc6902';
import { IconButton } from '@/components/button/icon-button';
import {
	HiOutlineTrash,
	HiOutlineUserGroup,
	HiOutlineUser,
	HiOutlineHeart,
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
import { IconLinkButton } from '@/components/button/icon-link-button';
import { characterFixup } from './fixupCharacter';
import { TabConfig, Tabs } from '@/components/tabs/tabs';
import { Prose } from '@/components/text/common';

export function FullCharacterSheet({
	document,
	onDeleteDocument,
	onUpdateDocument,
	translation,
}: GameObjectWidgetProps<Character>) {
	if (!document.data) {
		return 'Loading...';
	}

	const characterData = document.data;

	return (
		<div className="p-4">
			<div className="flex flex-row gap-3">
				<IconLinkButton title={translation('details.edit-roles')} to="roles">
					<HiOutlineUserGroup />
				</IconLinkButton>
				<IconButton.Destructive
					title={translation('details.delete')}
					onClick={onDeleteDocument}
				>
					<HiOutlineTrash />
				</IconButton.Destructive>
			</div>

			<CharacterSheet
				character={characterData}
				translation={translation}
				onUpdateDocument={onUpdateDocument}
			/>
		</div>
	);
}

const SectionHeader = Prose.extend(
	'SectionHeader',
	<p className="text-2xl font-bold my-4 border-b border-slate-700 dark:border-slate-300" />,
);

type TabContent = React.FC<{
	form: UseFormResult<CharacterDocument>;
	translation: GameObjectWidgetProps<CharacterDocument>['translation'];
}>;
const BioTab: TabContent = ({ form }) => (
	<>
		<Bio form={form} />
		<Notes form={form} />
	</>
);
const AbilitiesTab: TabContent = ({ form, translation: t }) => {
	return (
		<>
			<Abilities form={form} />
			<SectionHeader>{t('character-sheet.headers.wises')}</SectionHeader>
			<Wises form={form} />
			<SectionHeader>{t('character-sheet.headers.skills')}</SectionHeader>
			<Skills form={form} />
			<SectionHeader>{t('character-sheet.headers.traits')}</SectionHeader>
			<Traits form={form} />
		</>
	);
};

const tabInfo: [id: string, icon: typeof HiOutlineUser, content: TabContent][] =
	[
		['bio', HiOutlineUser, BioTab],
		['personality', HiOutlineHeart, Personality],
		['abilities', HiOutlineAcademicCap, AbilitiesTab],
		['rewards', HiOutlineHeart, Rewards],
		['conditions', HiOutlineHeart, Conditions],
	];

export function CharacterSheet({
	character,
	onUpdateDocument,
	translation: t,
}: {
	character: CharacterDocument;
	onUpdateDocument: Updater<Character>;
	translation: GameObjectWidgetProps<CharacterDocument>['translation'];
}) {
	const form = useForm({
		defaultValue: characterFixup.toForm(character),
		schema: CharacterDocument,
		translation: (f) => t(`character-sheet.${f}`),
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
