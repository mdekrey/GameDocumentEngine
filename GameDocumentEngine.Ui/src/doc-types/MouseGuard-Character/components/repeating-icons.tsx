import { GiPlainCircle, GiCircle } from 'react-icons/gi';
import type { IconType } from 'react-icons';
import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';

function RepeatIcon({
	className,
	value,
	icon: Icon,
}: {
	value: number;
	icon: IconType;
	className?: string;
}) {
	return (
		<>
			{Array(Math.max(0, value))
				.fill(0)
				.map((_, index) => (
					<Icon key={index} role="img" className={className} />
				))}
		</>
	);
}

export function FilledCircles({
	className,
	value,
}: {
	value: number;
	className?: string;
}) {
	return (
		<RepeatIcon className={className} value={value} icon={GiPlainCircle} />
	);
}

export function EmptyCircles({
	className,
	value,
}: {
	value: number;
	className?: string;
}) {
	return <RepeatIcon className={className} value={value} icon={GiCircle} />;
}

export function EmptyCirclesFromAtom({
	className,
	count,
}: {
	count: Atom<number>;
	className?: string;
}) {
	const value = useAtomValue(count);
	return <EmptyCircles value={value} className={className} />;
}
