import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import type { Character } from '../../character-types';
import {
	CardBase,
	CardContents,
	CardHint,
	CardIcon,
	CardTitle,
	Container,
} from './atoms';
import { HiHeart } from 'react-icons/hi2';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';
import { CircularNumberField } from '../CircularNumberField';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { HeartList } from './checklist/CheckboxList';

export function Hearts({
	form,
}: Pick<GameObjectFormComponent<Character>, 'form'>) {
	const fields = useFormFields(form, {
		hearts: ['details', 'combatValues', 'hearts'],
	});

	return <HeartsFields form={fields.hearts} />;
}

export function HeartsFields({
	form,
}: {
	form: FormFieldReturnType<Character['combatValues']['hearts']>;
}) {
	const fields = useFormFields(form, {
		base: ['base'],
		total: ['total'],
		current: ['current'],
		modifiers: ['modifiers'],
		injuries: ['injuries'],
	});

	const uncheckedHearts = useComputedAtom(
		(get) => get(fields.total.value) - get(fields.current.value),
	);

	return (
		<Container>
			<CardIcon icon={HiHeart} />
			<CardTitle>{form.translation('title')}</CardTitle>
			<CardHint>{form.translation('hint')}</CardHint>

			<CardBase>
				<CircularNumberField field={fields.base} />
			</CardBase>
			<CardContents className="flex flex-col gap-2">
				<div className="flex flex-row gap-4">
					<CircularNumberField.Main field={fields.total} />
					<div className="flex-1">
						<HeartList
							uncheckedCount={uncheckedHearts}
							checkedCount={fields.current.value}
							checkedTitle={fields.current.translation('remove-heart')}
							uncheckedTitle={fields.current.translation('fill-heart')}
							onUncheck={() => adjust(-1)}
							onCheck={() => adjust(1)}
						/>
						<TextareaField field={fields.modifiers} />
					</div>
				</div>
				<TextareaField field={fields.injuries} />
			</CardContents>
		</Container>
	);

	function adjust(modifier: 1 | -1) {
		fields.current.onChange((prev) => prev + modifier);
	}
}
