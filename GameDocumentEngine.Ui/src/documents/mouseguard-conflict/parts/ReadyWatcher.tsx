import { useFormFields } from '@/utils/form/useFormFields';
import { ActionChoice, SideState } from '../conflict-types';
import { useEffect } from 'react';
import { FormFieldReturnType } from '@/utils/form/useForm';
import { useAtomValue } from 'jotai';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { produce } from 'immer';

function allChoicesSelected(
	choices: (ActionChoice | null)[],
): choices is [ActionChoice, ActionChoice, ActionChoice] {
	return choices.length == 3 && !choices.some((choice) => choice == null);
}

export function ReadyWatcher({
	yourSide,
	otherSide,
	onSave,
}: {
	yourSide: FormFieldReturnType<SideState>;
	otherSide: FormFieldReturnType<SideState>;
	onSave: () => void;
}) {
	const isYourSideReady = useAtomValue(
		useComputedAtom((get) => !!get(yourSide.atom).ready),
	);
	const isOtherSideReady = useAtomValue(
		useComputedAtom((get) => !!get(otherSide.atom).ready),
	);
	const fields = useFormFields(yourSide, {
		choices: ['choices'],
		revealed: ['revealed'],
		ready: ['ready'],
	});
	const currentChoices = useAtomValue(fields.choices.atom);
	const currentRevealed = useAtomValue(fields.revealed.atom);
	const currentReady = useAtomValue(fields.ready.atom);
	useEffect(() => {
		const currentRevealed = fields.revealed.get();

		const choices = fields.choices.get();
		if (isYourSideReady && !allChoicesSelected(choices)) {
			fields.ready.setValue(false);
		} else if (
			allChoicesSelected(choices) &&
			isYourSideReady &&
			isOtherSideReady &&
			currentRevealed?.length !== 3
		) {
			// reveal it!
			fields.revealed.setValue(choices);
		} else if (
			currentRevealed?.length === 3 &&
			(!isYourSideReady || !isOtherSideReady)
		) {
			// clear out both
			yourSide.setValue((prev) =>
				produce(prev, (draft) => {
					delete draft.revealed;
					delete draft.ready;
					draft.choices = [];
				}),
			);
		}
	}, [isYourSideReady, isOtherSideReady, fields, yourSide, onSave]);
	useEffect(() => {
		onSave();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentChoices, currentRevealed, currentReady]);
	return null;
}
