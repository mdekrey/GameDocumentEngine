import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { FieldProps } from '../FieldProps';
import { ToggleButton } from './toggle-button';
import { AtomContents } from '../../jotai/atom-contents';
import { useStore } from 'jotai';

export type ToggleButtonFieldProps = Pick<
	React.ComponentProps<typeof ToggleButton>,
	'className'
> &
	FieldProps<boolean> & {
		pressedContents?: React.ReactNode;
		unpressedContents?: React.ReactNode;
	};

export function ToggleButtonField({
	field,
	className,
	pressedContents,
	unpressedContents,
}: ToggleButtonFieldProps) {
	const store = useStore();
	const label = useComputedAtom((get) =>
		get(field.value)
			? field.translation('pressed')
			: field.translation('not-pressed'),
	);
	const display = useComputedAtom((get) =>
		get(field.value)
			? pressedContents ?? field.translation('pressed')
			: unpressedContents ?? field.translation('not-pressed'),
	);
	return (
		<ToggleButton
			pressed={field.value}
			title={label}
			className={className}
			onBlur={field.onBlur}
			onClick={() => field.onChange(!store.get(field.value))}
		>
			<AtomContents>{display}</AtomContents>
		</ToggleButton>
	);
}
