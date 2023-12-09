import { NumberField } from '@/components/form-fields/text-input/number-field';
import styles from './CircularNumberField.module.css';
import { twMerge } from 'tailwind-merge';

export const CircularNumberField = NumberField.Integer.extend(
	'CircularNumberField',
	(T) => <T className={styles.circularNumber} />,
	{
		useProps({ labelClassName, inputClassName, ...props }) {
			return {
				...props,
				labelClassName: twMerge(labelClassName, styles.label),
				inputClassName: twMerge(inputClassName, styles.input),
			};
		},
	},
).themed({
	Main: (T) => <T className={styles.main} />,
	TextRight: (T) => <T className={styles.textRight} />,
});
