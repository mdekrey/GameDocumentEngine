import { NumberField } from '@/components/form-fields/text-input/number-field';
import styles from './CircularNumberField.module.css';
import { elementTemplate } from '@/components/template';

export const CircularNumberField = elementTemplate<typeof NumberField.Integer>(
	'CircularNumberField',
	// @ts-expect-error Used here as a template; do not check all props since they'll still be required
	<NumberField.Integer className={styles.circularNumber} />,
).themed({
	Main: <div className={styles.main} />,
});
