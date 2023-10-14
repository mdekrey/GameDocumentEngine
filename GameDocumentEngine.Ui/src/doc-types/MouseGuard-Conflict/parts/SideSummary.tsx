import type { SideState } from '../conflict-types';
import { ReactComponent as DispositionBanner } from './disposition-horizontal.svg';
import type { FormFieldReturnType } from '@/utils/form';
import { useFormFields } from '@/utils/form';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import styles from './side-summary.module.css';
import { useAtomValue } from 'jotai';
import { Prose } from '@/components/text/common';

export function SideSummary({
	side,
}: {
	side: FormFieldReturnType<SideState>;
}) {
	const fields = useFormFields(side, {
		name: ['name'],
		current: ['disposition', 'current'],
		max: ['disposition', 'max'],
		ready: ['ready'],
	});
	const isReady = useAtomValue(fields.ready.atom);
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

			<Prose className="text-center">
				{isReady
					? fields.ready.translation('is-ready')
					: fields.ready.translation('is-not-ready')}
			</Prose>
		</div>
	);
}
