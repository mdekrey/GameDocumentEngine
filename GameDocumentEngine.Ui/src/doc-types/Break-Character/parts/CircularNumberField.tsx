import { NumberField } from '@/components/form-fields/text-input/number-field';
import styles from './CircularNumberField.module.css';
import { useTwMerge } from '@/components/jotai/useTwMerge';

export function CircularNumberField({
	className,
	...props
}: React.ComponentProps<typeof NumberField.Integer>) {
	return (
		<NumberField.Integer
			className={useTwMerge(className, styles.circularNumber)}
			{...props}
		/>
	);
}
