import type { FormFieldReturnType } from '@/utils/form';
import { useFormFields } from '@/utils/form';
import type { Atom } from 'jotai';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { CheckboxList } from './CheckboxList';
import { twMerge } from 'tailwind-merge';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import { useDocTypeTranslation } from '@/utils/api/hooks';

export function PassFail({
	advancement,
	maxPasses,
	maxFails,
	padToCount,
	className,
}: {
	advancement: FormFieldReturnType<{ passes: number; fails: number }>;
	maxPasses: Atom<number>;
	maxFails: Atom<number>;
	padToCount: Atom<number>;
	className?: string;
}) {
	const t = useDocTypeTranslation('MouseGuard-Character');
	const fields = useFormFields(advancement, {
		passes: ['passes'],
		fails: ['fails'],
	});
	const passesUncheckedCount = useComputedAtom(
		(get) => get(maxPasses) - get(fields.passes.value),
	);
	const failsUncheckedCount = useComputedAtom(
		(get) => get(maxFails) - get(fields.fails.value),
	);
	const passesSpacing = useComputedAtom(
		(get) =>
			get(padToCount) - Math.max(get(maxPasses), get(fields.passes.value)),
	);
	const failsSpacing = useComputedAtom(
		(get) => get(padToCount) - Math.max(get(maxFails), get(fields.fails.value)),
	);

	return (
		<div
			className={twMerge(
				'flex flex-col justify-between items-start',
				className,
			)}
		>
			<div className="flex gap-2 items-center">
				<span>{t('character-sheet.passes-and-fails.pass-abbrev')}:</span>
				<NumberField.Integer field={fields.passes} className="sr-only" />
				<CheckboxList
					checkedCount={fields.passes.value}
					uncheckedCount={passesUncheckedCount}
					paddingCount={passesSpacing}
					checkedTitle={fields.passes.translation('decrease')}
					uncheckedTitle={fields.passes.translation('increase')}
					onUncheck={() => adjust('passes', -1)}
					onCheck={() => adjust('passes', 1)}
				/>
			</div>
			<div className="flex gap-2 items-center">
				<span>{t('character-sheet.passes-and-failsfail-abbrev')}:</span>
				<NumberField.Integer field={fields.fails} className="sr-only" />
				<CheckboxList
					checkedCount={fields.fails.value}
					uncheckedCount={failsUncheckedCount}
					paddingCount={failsSpacing}
					checkedTitle={fields.fails.translation('decrease')}
					uncheckedTitle={fields.fails.translation('increase')}
					onUncheck={() => adjust('fails', -1)}
					onCheck={() => adjust('fails', 1)}
				/>
			</div>
		</div>
	);

	function adjust(type: keyof typeof fields, modifier: 1 | -1) {
		fields[type].onChange((prev) => prev + modifier);
	}
}
