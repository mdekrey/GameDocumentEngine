import { GameObjectWidgetProps, Updater } from '../defineDocument';
import { useDebugValue } from 'react';
import { useForm } from '@/utils/form/useForm';
import { Character, CharacterDocument } from './character-types';
import { applyPatch, createPatch } from 'rfc6902';
import { ButtonRow } from '@/components/button/button-row';
import { Button } from '@/components/button/button';
import { IconButton } from '@/components/button/icon-button';
import { HiOutlineTrash } from 'react-icons/hi2';
import { Bio } from './parts/bio';
import { Personality } from './parts/personality';
import { Notes } from './parts/notes';
import { Abilities } from './parts/abilities';
import { Wises } from './parts/wises';
import { Skills } from './parts/skills';
import { Traits } from './parts/traits';
import { Rewards } from './parts/rewards';
import { Conditions } from './parts/conditions';

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
		<>
			<IconButton.Destructive
				title={translation('details.delete')}
				onClick={onDeleteDocument}
			>
				<HiOutlineTrash />
			</IconButton.Destructive>

			<CharacterSheet
				character={characterData}
				translation={translation}
				onUpdateDocument={onUpdateDocument}
			/>
		</>
	);
}

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
		defaultValue: character,
		schema: CharacterDocument,
		translation: (f) => t(`character-sheet.${f}`),
	});

	useDebugValue(form);
	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="flex flex-col gap-2"
		>
			<Bio form={form} />
			<Personality form={form} />
			<Notes form={form} />
			<Abilities form={form} />
			<Wises form={form} />
			<Skills form={form} />
			<Traits form={form} />
			<Rewards form={form} />
			<Conditions form={form} />

			<ButtonRow>
				<Button type="submit">{t('submit')}</Button>
			</ButtonRow>
		</form>
	);

	function onSubmit(currentValue: CharacterDocument) {
		const ops = createPatch(
			{
				name: character.name,
				details: character.details,
			},
			currentValue,
		);
		console.log(currentValue);
		onUpdateDocument((prev) => {
			applyPatch(prev, ops);
		});
	}
}
