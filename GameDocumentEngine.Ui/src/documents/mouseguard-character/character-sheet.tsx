import { GameObjectWidgetProps, Updater } from '../defineDocument';
import { useCallback, useEffect } from 'react';
import { useForm } from '@/utils/form/useForm';
import { Character, CharacterDocument } from './character-types';
import { applyPatch, createPatch } from 'rfc6902';
import { IconButton } from '@/components/button/icon-button';
import { HiOutlineTrash, HiOutlineUserGroup } from 'react-icons/hi2';
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
import { updateFormDefault } from '@/utils/form/update-form-default';
import { IconLinkButton } from '@/components/button/icon-link-button';
import { fixupCharacter } from './fixupCharacter';

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
	updateFormDefault(form, character, fixupCharacter);

	const onSubmit = useCallback(
		function onSubmit(currentValue: CharacterDocument) {
			const fixedUp = fixupCharacter(currentValue);
			const ops = createPatch(
				{
					name: character.name,
					details: character.details,
				},
				fixedUp,
			);
			if (ops.length > 0)
				onUpdateDocument((prev) => {
					applyPatch(prev, ops);
				});
		},
		[character, onUpdateDocument],
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
		</form>
	);
}
