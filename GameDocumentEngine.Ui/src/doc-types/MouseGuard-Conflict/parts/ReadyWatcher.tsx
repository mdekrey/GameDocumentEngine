import { useFormFields } from '@/utils/form';
import type { ActionChoice, SideState } from '../conflict-types';
import { useEffect } from 'react';
import type { FormFieldReturnType } from '@/utils/form';
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
}: {
	yourSide: FormFieldReturnType<SideState>;
	otherSide: FormFieldReturnType<SideState>;
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
	useEffect(() => {
		const currentRevealed = fields.revealed.get();

		const choices = fields.choices.get();
		if (isYourSideReady && !allChoicesSelected(choices)) {
			fields.ready.onChange(false);
		} else if (
			allChoicesSelected(choices) &&
			isYourSideReady &&
			isOtherSideReady &&
			currentRevealed?.length !== 3
		) {
			// reveal it!
			fields.revealed.onChange(choices);
		} else if (
			currentRevealed?.length === 3 &&
			(!isYourSideReady || !isOtherSideReady)
		) {
			// clear out both
			yourSide.onChange((prev) =>
				produce(prev, (draft) => {
					delete draft.revealed;
					delete draft.ready;
					draft.choices = [];
				}),
			);
		}
	}, [isYourSideReady, isOtherSideReady, fields, yourSide]);
	return null;
}
