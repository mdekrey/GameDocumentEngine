import { NumberField } from '@/components/form-fields/text-input/number-field';
import styles from './CircularNumberField.module.css';
import { elementTemplate } from '@/components/template';

export const CircularNumberField = elementTemplate(
	'CircularNumberField',
	NumberField.Integer,
	(T) => <T className={styles.circularNumber} />,
).themed({
	Main: (T) => <T className={styles.main} />,
	TextRight: (T) => <T className={styles.textRight} />,
});
