import { GiPlainCircle, GiCircle } from 'react-icons/gi';
import { IconType } from 'react-icons';
import { Atom, useAtomValue } from 'jotai';

function RepeatIcon({ value, icon: Icon }: { value: number; icon: IconType }) {
	return (
		<>
			{Array(Math.max(0, value))
				.fill(0)
				.map((_, index) => (
					<Icon key={index} aria-role="img" />
				))}
		</>
	);
}

export function FilledCircles({ value }: { value: number }) {
	return <RepeatIcon value={value} icon={GiPlainCircle} />;
}

export function EmptyCircles({ value }: { value: number }) {
	return <RepeatIcon value={value} icon={GiCircle} />;
}

export function EmptyCirclesFromAtom({ count }: { count: Atom<number> }) {
	const value = useAtomValue(count);
	return <EmptyCircles value={value} />;
}
