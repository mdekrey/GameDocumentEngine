import { withSlots } from 'react-slot-component';
import type { FormFieldReturnType } from '@/utils/form';
import layout from './ability-layout.module.css';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { PassFail } from './pass-fail';
import type { Atom } from 'jotai';
import { twMerge } from 'tailwind-merge';

export type AbilityLayoutSlots = {
	Rating: {
		children?: React.ReactNode;
	};
};
export type AbilityLayoutProps = {
	baseField: Pick<FormFieldReturnType<never>, 'translation'>;
	passFailMaxRating: Atom<number>;
	advancement: FormFieldReturnType<{ passes: number; fails: number }>;
	passFailPadding: Atom<number>;
	children?: React.ReactNode;
};

export const AbilityLayout = withSlots<AbilityLayoutSlots, AbilityLayoutProps>(
	({
		baseField,
		passFailMaxRating,
		advancement,
		slotProps,
		passFailPadding,
	}) => {
		const maxFails = useComputedAtom((get) => get(passFailMaxRating) - 1);

		return (
			<div
				className={twMerge(
					layout.layout,
					'group/ability focus-within:bg-slate-100 dark:focus-within:bg-slate-900',
				)}
			>
				<div
					className={twMerge(
						layout.label,
						'text-lg self-center flex-1 group-focus-within/ability:font-bold',
					)}
				>
					{baseField.translation(['label'])}
				</div>
				<div
					className={twMerge(layout.rating, 'flex flex-row gap-2 items-center')}
				>
					{slotProps.Rating?.children}
				</div>
				<PassFail
					className={layout.passfail}
					advancement={advancement}
					maxPasses={passFailMaxRating}
					maxFails={maxFails}
					padToCount={passFailPadding}
				/>
			</div>
		);
	},
);
AbilityLayout.displayName = 'AbilityLayout';
