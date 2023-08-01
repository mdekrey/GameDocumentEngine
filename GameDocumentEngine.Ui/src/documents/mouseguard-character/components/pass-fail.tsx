import { FormFieldReturnType } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { Atom } from 'jotai';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { useTranslation } from 'react-i18next';
import { EmptyCirclesFromAtom } from './repeating-icons';
import { CheckboxesButton } from './checkboxes-button';

export function PassFail({
	advancement,
	rating,
	padToCount,
}: {
	advancement: FormFieldReturnType<{ passes: number; fails: number }>;
	rating: Atom<number>;
	padToCount: number;
}) {
	const { t } = useTranslation('doc-types:MouseGuard-Character', {
		keyPrefix: 'character-sheet.passes-and-fails',
	});
	const fields = useFormFields(advancement, {
		passes: ['passes'],
		fails: ['fails'],
	});
	const passesUncheckedChecked = useComputedAtom(
		(get) => get(rating) - get(fields.passes.value),
	);
	const failsUncheckedChecked = useComputedAtom(
		(get) => get(rating) - 1 - get(fields.fails.value),
	);
	const spacing = useComputedAtom((get) => padToCount - get(rating));

	return (
		<div className="flex flex-col justify-between">
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
				<span className="inline-flex gap-2 invisible">
					<EmptyCirclesFromAtom count={spacing} />
				</span>
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
			</div>
		</div>
	);

	function adjust(type: keyof typeof fields, modifier: 1 | -1) {
		fields[type].setValue((prev) => prev + modifier);
		fields[type].onBlur();
	}
}
