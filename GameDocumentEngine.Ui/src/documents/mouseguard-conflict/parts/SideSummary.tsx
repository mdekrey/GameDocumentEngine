import { SideState } from '../conflict-types';
import { ReactComponent as DispositionBanner } from './disposition-horizontal.svg';
import { FormFieldReturnType } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import styles from './side-summary.module.css';

export function SideSummary({
	side,
}: {
	side: FormFieldReturnType<SideState>;
}) {
	const fields = useFormFields(side, {
		name: ['name'],
		current: ['disposition', 'current'],
		max: ['disposition', 'max'],
	});
	return (
		<div className="max-w-[200px]">
			<TextField
				field={fields.name}
				labelClassName="hidden"
				inputClassName="border-none py-0 text-center text-xl"
			/>

			<div className="relative">
				<DispositionBanner className="w-full" />
				<NumberField.Integer
					field={fields.current}
					className={styles.current}
					labelClassName={styles.label}
					contentsClassName={styles.contents}
					inputClassName={`${styles.input} border-none`}
				/>
				<NumberField.Integer
					field={fields.max}
					className={styles.max}
					labelClassName={styles.label}
					contentsClassName={styles.contents}
					inputClassName={`${styles.input} border-none`}
				/>
			</div>
		</div>
	);
}
