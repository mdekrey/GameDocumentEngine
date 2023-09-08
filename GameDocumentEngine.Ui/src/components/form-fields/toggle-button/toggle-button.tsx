import {
	isAtom,
	mapProperty,
	useComputedAtom,
	withSignal,
} from '@principlestudios/jotai-react-signals';
import type { Atom } from 'jotai';
import { useTwMerge } from '../../jotai/useTwMerge';

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
	readOnly,
}: {
	className?: string | Atom<string>;
	pressed: boolean | Atom<boolean>;
	children?: React.ReactNode;
	title: string | Atom<string>;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	onBlur?: React.FocusEventHandler<HTMLButtonElement>;
	readOnly?: boolean;
}) {
	const ariaPressed = useComputedAtom((get) =>
		(isAtom(pressed) ? get(pressed) : pressed) ? 'true' : 'false',
	);
	const actualClassName = useTwMerge(
		'p-2 border border-slate-500',
		useComputedAtom((get) =>
			(isAtom(pressed) ? get(pressed) : pressed)
				? 'dark:bg-white dark:text-slate-800 bg-slate-950 text-slate-100'
				: 'dark:bg-slate-900 dark:text-white bg-slate-100 text-slate-800',
		),
		className,
	);
	return (
		<JotaiToggleButton
			type="button"
			className={actualClassName}
			onClick={readOnly ? undefined : onClick}
			onBlur={onBlur}
			aria-pressed={ariaPressed}
			title={title}
			aria-label={title}
			aria-readonly={readOnly}
		>
			{children}
		</JotaiToggleButton>
	);
}
