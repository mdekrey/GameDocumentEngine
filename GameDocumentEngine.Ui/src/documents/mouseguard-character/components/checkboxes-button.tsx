import { Atom, useAtomValue } from 'jotai';
import { EmptyCircles, FilledCircles } from './repeating-icons';

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
			className="inline-flex gap-2"
			title={title}
			aria-label={title}
			onClick={onClick}
		>
			{filled ? (
				<FilledCircles value={value} />
			) : (
				<EmptyCircles value={value} />
			)}
		</button>
	);
}
