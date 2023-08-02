import {
	isAtom,
	mapProperty,
	useComputedAtom,
	withSignal,
} from '@principlestudios/jotai-react-signals';
import { Atom } from 'jotai';
import { useTwMerge } from '../jotai/useTwMerge';

const JotaiToggleButton = withSignal('button', {
	className: mapProperty('className'),
	'aria-pressed': mapProperty('ariaPressed'),
	title: mapProperty('title'),
	'aria-label': mapProperty('ariaLabel'),
});

export function ToggleButton({
	pressed,
	children,
	title,
	className,
	onClick,
	onBlur,
}: {
	className?: string | Atom<string>;
	pressed: boolean | Atom<boolean>;
	children?: React.ReactNode;
	title: string | Atom<string>;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	onBlur?: React.FocusEventHandler<HTMLButtonElement>;
}) {
	const ariaPressed = useComputedAtom((get) =>
		(isAtom(pressed) ? get(pressed) : pressed) ? 'true' : 'false',
	);
	const actualClassName = useTwMerge(
		'p-2 border border-gray-500',
		useComputedAtom((get) =>
			(isAtom(pressed) ? get(pressed) : pressed)
				? 'bg-gray-500 text-white'
				: 'bg-white text-black',
		),
		className,
	);
	return (
		<JotaiToggleButton
			type="button"
			className={actualClassName}
			onClick={onClick}
			onBlur={onBlur}
			aria-pressed={ariaPressed}
			title={title}
			aria-label={title}
		>
			{children}
		</JotaiToggleButton>
	);
}
