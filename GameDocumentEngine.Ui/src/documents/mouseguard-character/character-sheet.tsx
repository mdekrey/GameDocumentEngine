import { GameObjectWidgetProps, Updater } from '../defineDocument';
import { useDebugValue } from 'react';
import { Bio } from './parts/bio';
import { useForm } from '@/utils/form/useForm';
import { Character, CharacterDocument } from './character-types';
import { applyPatch, createPatch } from 'rfc6902';
import { ButtonRow } from '@/components/button/button-row';
import { Button } from '@/components/button/button';

export function FullCharacterSheet({
	document,
	// TODO: onDeleteDocument,
	onUpdateDocument,
	translation,
}: GameObjectWidgetProps<Character>) {
	if (!document.data) {
		return 'Loading...';
	}

	const characterData = document.data;

	return (
		<CharacterSheet
			character={characterData}
			translation={translation}
			onUpdateDocument={onUpdateDocument}
		/>
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
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<Bio form={form} />

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
