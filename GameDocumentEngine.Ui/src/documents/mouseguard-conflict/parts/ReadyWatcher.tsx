import { useFormFields } from '@/utils/form/useFormFields';
import { SideState } from '../conflict-types';
import { useEffect } from 'react';
import { FormFieldReturnType } from '@/utils/form/useForm';
import { useAtomValue } from 'jotai';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { produce } from 'immer';

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
	});
	useEffect(() => {
		const currentRevealed = fields.revealed.get();
		console.log({
			yourSide: JSON.stringify(yourSide.get()),
			currentRevealed,
			isYourSideReady,
			isOtherSideReady,
		});

		if (isYourSideReady && isOtherSideReady && currentRevealed?.length !== 3) {
			// reveal it!
			fields.revealed.setValue(fields.choices.get());
			onSave();
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
			onSave();
		}
	}, [isYourSideReady, isOtherSideReady, fields, yourSide, onSave]);
	return null;
}
