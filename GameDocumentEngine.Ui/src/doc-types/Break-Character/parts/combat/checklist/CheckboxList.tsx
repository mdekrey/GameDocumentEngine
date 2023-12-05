import type { Atom } from 'jotai';
import { CheckboxesButton } from './checkboxes-button';

export function HeartList({
	checkedCount,
	uncheckedCount,
	checkedTitle,
	uncheckedTitle,
	onUncheck,
	onCheck,
}: {
	checkedCount: Atom<number>;
	uncheckedCount: Atom<number>;
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
		</div>
	);
}
