import type { GameObjectWidgetProps, Updater } from '../defineDocument';
import { useCallback, useEffect } from 'react';
import { useForm } from '@/utils/form/useForm';
import type { Character} from './character-types';
import { CharacterDocument } from './character-types';
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
import { updateFormDefaultMapped } from '@/utils/form/update-form-default';
import { IconLinkButton } from '@/components/button/icon-link-button';
import { characterFixup } from './fixupCharacter';

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
