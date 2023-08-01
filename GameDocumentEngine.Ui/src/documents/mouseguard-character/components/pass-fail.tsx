import { FormFieldReturnType } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { Atom } from 'jotai';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { useTranslation } from 'react-i18next';
import { EmptyCirclesFromAtom } from './repeating-icons';
import { CheckboxesButton } from './checkboxes-button';

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
	const passesUncheckedChecked = useComputedAtom(
		(get) => get(maxPasses) - get(fields.passes.value),
	);
	const failsUncheckedChecked = useComputedAtom(
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
				<CheckboxesButton
					count={fields.passes.value}
					filled
					title={fields.passes.translation('decrease')}
					onClick={() => adjust('passes', -1)}
				/>
				<CheckboxesButton
					count={passesUncheckedChecked}
					title={fields.passes.translation('increase')}
					onClick={() => adjust('passes', 1)}
				/>
				<EmptyCirclesFromAtom count={passesSpacing} className="invisible" />
			</div>
			<div className="flex gap-2 items-center">
				<span>{t('fail-abbrev')}:</span>
				<CheckboxesButton
					count={fields.fails.value}
					filled
					title={fields.fails.translation('decrease')}
					onClick={() => adjust('fails', -1)}
				/>
				<CheckboxesButton
					count={failsUncheckedChecked}
					title={fields.fails.translation('increase')}
					onClick={() => adjust('fails', 1)}
				/>
				<EmptyCirclesFromAtom count={failsSpacing} className="invisible" />
			</div>
		</div>
	);

	function adjust(type: keyof typeof fields, modifier: 1 | -1) {
		fields[type].setValue((prev) => prev + modifier);
		fields[type].onBlur();
	}
}
