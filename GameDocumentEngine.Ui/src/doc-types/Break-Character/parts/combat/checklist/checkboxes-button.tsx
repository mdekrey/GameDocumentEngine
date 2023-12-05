import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';
import { EmptyHearts, FilledHearts } from './repeating-icons';

export function CheckboxesButton({
	count,
	filled,
	title,
	onClick,
}: {
	count: Atom<number>;
	filled?: boolean;
	title: string;
	onClick?: () => void;
}) {
	const value = useAtomValue(count);
	if (value === 0) return null;
	return (
		<button
			type="button"
			disabled={value === 0}
			className="inline-flex gap-2 text-2xl"
			title={title}
			aria-label={title}
			onClick={onClick}
		>
			{filled ? <FilledHearts value={value} /> : <EmptyHearts value={value} />}
		</button>
	);
}
