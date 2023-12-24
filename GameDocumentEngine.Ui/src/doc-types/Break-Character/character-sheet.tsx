import {
	HiOutlineUser,
	HiOutlineHeart,
	HiOutlineListBullet,
	HiChatBubbleLeftRight,
} from 'react-icons/hi2';
import { CombatValues } from './parts/combat-values';
import { Tabs } from '@/components/tabs/tabs';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import type { Character } from './character-types';
import { Identity } from './parts/identity';
import { Aptitudes } from './parts/aptitudes';
import { LuBackpack, LuSword } from 'react-icons/lu';
import { Abilities } from './parts/abilities';
import { Social } from './parts/social';
import { Gear } from './parts/gear';
import { useTranslationForDocument } from '@/utils/api/hooks';

const tabInfo: [
	id: string,
	icon: typeof HiOutlineUser,
	content: React.FC<GameObjectFormComponent<Character>>,
][] = [
	['identity', HiOutlineUser, Identity],
	['aptitudes', HiOutlineHeart, Aptitudes],
	['combat', LuSword, CombatValues],
	['abilities', HiOutlineListBullet, Abilities],
	['social', HiChatBubbleLeftRight, Social],
	['inventory', LuBackpack, Gear],
];

export function CharacterSheet({
	form,
	onSubmit,
	...remaining
}: GameObjectFormComponent<Character>) {
	const t = useTranslationForDocument(remaining.document);
	useSubmitOnChange(form, onSubmit);

	const tabs = tabInfo.map(([key, icon, Component]) => ({
		key,
		icon,
		title: t(`character-sheet.tabs.${key}`),
		content: <Component form={form} onSubmit={onSubmit} {...remaining} />,
	}));

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="flex flex-col gap-2"
		>
			<Tabs tabs={tabs} />
		</form>
	);
}
