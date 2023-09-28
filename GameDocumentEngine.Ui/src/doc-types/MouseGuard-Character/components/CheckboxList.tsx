import type { Atom } from 'jotai';
import { EmptyCirclesFromAtom } from './repeating-icons';
import { CheckboxesButton } from './checkboxes-button';
import { useAsAtom } from '@principlestudios/jotai-react-signals';

export function CheckboxList({
	checkedCount,
	uncheckedCount,
	paddingCount,
	checkedTitle,
	uncheckedTitle,
	onUncheck,
	onCheck,
}: {
	checkedCount: Atom<number>;
	uncheckedCount: Atom<number>;
	paddingCount: number | Atom<number>;
	checkedTitle: string;
	uncheckedTitle: string;
	onUncheck: () => void;
	onCheck: () => void;
}) {
	return (
		<div className="flex gap-2 items-center">
			<CheckboxesButton
				count={checkedCount}
				filled
				title={checkedTitle}
				onClick={onUncheck}
			/>
			<CheckboxesButton
				count={uncheckedCount}
				title={uncheckedTitle}
				onClick={onCheck}
			/>
			<EmptyCirclesFromAtom
				count={useAsAtom(paddingCount)}
				className="invisible"
			/>
		</div>
	);
}
