import { FormFieldReturnType } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { Atom } from 'jotai';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { useTranslation } from 'react-i18next';
import { CheckboxList } from './CheckboxList';

export function PassFail({
	advancement,
	maxPasses,
	maxFails,
	padToCount,
}: {
	advancement: FormFieldReturnType<{ passes: number; fails: number }>;
	maxPasses: Atom<number>;
	maxFails: Atom<number>;
	padToCount: Atom<number>;
}) {
	const { t } = useTranslation('doc-types:MouseGuard-Character', {
		keyPrefix: 'character-sheet.passes-and-fails',
	});
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
		<div className="flex flex-col justify-between pr-2">
			<div className="flex gap-2 items-center">
				<span>{t('pass-abbrev')}:</span>
				{/* TODO: accessible number of passes/fails; a sr-only TextField crashes */}
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
				<span>{t('fail-abbrev')}:</span>
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
		fields[type].setValue((prev) => prev + modifier);
		fields[type].onBlur();
	}
}
