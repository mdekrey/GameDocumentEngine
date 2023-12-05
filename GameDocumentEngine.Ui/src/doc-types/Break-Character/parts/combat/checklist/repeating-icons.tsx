import { HiOutlineHeart, HiHeart } from 'react-icons/hi2';
import type { IconType } from 'react-icons';

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

export function FilledHearts({
	className,
	value,
}: {
	value: number;
	className?: string;
}) {
	return <RepeatIcon className={className} value={value} icon={HiHeart} />;
}

export function EmptyHearts({
	className,
	value,
}: {
	value: number;
	className?: string;
}) {
	return (
		<RepeatIcon className={className} value={value} icon={HiOutlineHeart} />
	);
}
