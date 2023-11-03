import { isAtom } from '@principlestudios/jotai-utilities/isAtom';
import {
	mapProperty,
	useComputedAtom,
	withSignal,
} from '@principlestudios/jotai-react-signals';
import { useStore, type Atom } from 'jotai';
import { useTwMerge } from '../../jotai/useTwMerge';

const JotaiToggleButton = withSignal('button', {
	className: mapProperty('className'),
	'aria-pressed': mapProperty('ariaPressed'),
	title: mapProperty('title'),
	'aria-label': mapProperty('ariaLabel'),
	'aria-readonly': mapProperty('ariaReadOnly'),
	'aria-disabled': mapProperty('ariaDisabled'),
});

function useBooleanishAtom(
	value: undefined | boolean | Atom<boolean>,
): Atom<'true' | 'false'> {
	return useComputedAtom((get) =>
		(isAtom(value) ? get(value) : value) ? 'true' : 'false',
	);
}

export function ToggleButton({
	pressed,
	children,
	title,
	className,
	onClick,
	onBlur,
	readOnly,
	disabled,
}: {
	className?: string | Atom<string>;
	pressed: boolean | Atom<boolean>;
	children?: React.ReactNode;
	title: string | Atom<string>;
	onClick?: React.MouseEventHandler<HTMLButtonElement>;
	onBlur?: React.FocusEventHandler<HTMLButtonElement>;
	readOnly?: boolean | Atom<boolean>;
	disabled?: boolean | Atom<boolean>;
}) {
	const store = useStore();
	const ariaPressed = useBooleanishAtom(pressed);
	const ariaReadOnly = useBooleanishAtom(readOnly);
	const ariaDisabled = useBooleanishAtom(disabled);
	return (
		<JotaiToggleButton
			type="button"
			className={useTwMerge(
				'p-2 border border-slate-500',
				useComputedAtom((get) =>
					(isAtom(pressed) ? get(pressed) : pressed)
						? 'dark:bg-white dark:text-slate-800 bg-slate-950 text-slate-100'
						: 'dark:bg-slate-900 dark:text-white bg-slate-100 text-slate-800',
				),
				useComputedAtom((get) =>
					(isAtom(disabled) ? get(disabled) : disabled) ? 'opacity-20' : '',
				),
				className,
			)}
			onClick={internalOnClick}
			onBlur={onBlur}
			aria-pressed={ariaPressed}
			title={title}
			aria-label={title}
			aria-readonly={ariaReadOnly}
			aria-disabled={ariaDisabled}
		>
			{children}
		</JotaiToggleButton>
	);
	function internalOnClick(ev: React.MouseEvent<HTMLButtonElement>) {
		if (readOnly === true || (isAtom(readOnly) && store.get(readOnly))) return;
		if (disabled === true || (isAtom(disabled) && store.get(disabled))) return;
		onClick?.(ev);
	}
}
