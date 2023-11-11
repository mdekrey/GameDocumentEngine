import type { TabConfig } from '@/components/tabs/tabs';
import type { HiOutlineUser } from 'react-icons/hi2';
import {
	HiOutlineHeart,
	HiOutlineListBullet,
	HiOutlineAcademicCap,
} from 'react-icons/hi2';
import { Tabs } from '@/components/tabs/tabs';
import type {
	GameObjectFormComponent,
	GameObjectWidgetProps,
} from '@/documents/defineDocument';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import { useMemo } from 'react';
import type { Character, CharacterDocument } from './character-types';
import type { UseFormResult } from '@principlestudios/react-jotai-forms';
import { AtomContents } from '@/components/jotai/atom-contents';
import { atom } from 'jotai';

type TabContent = React.FC<{
	form: UseFormResult<CharacterDocument>;
	translation: GameObjectWidgetProps<CharacterDocument>['translation'];
}>;

const tabInfo: [id: string, icon: typeof HiOutlineUser, content: TabContent][] =
	[];

export function CharacterSheet({
	form,
	onSubmit,
	translation: t,
}: GameObjectFormComponent<Character>) {
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

	const contents = atom((get) => JSON.stringify(get(form.atom)));

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="flex flex-col gap-2"
		>
			<AtomContents>{contents}</AtomContents>
			<Tabs tabs={tabs} />
		</form>
	);
}
