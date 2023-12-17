import { useAtomValue } from 'jotai';
import { useAsAtom } from '@principlestudios/jotai-react-signals';
import { Fragment } from 'react';
import { HiCheck, HiChevronUpDown } from 'react-icons/hi2';
import { Listbox, Transition } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';
import type { FieldMapping } from '@/utils/form';
import type { SelectInputProps } from '@/components/form-fields/select-input/select-input';
import type { ActionChoice } from '../conflict-types';
import { actionChoices } from '../conflict-types';
import attackCard from '@/doc-types/mouseguard-assets/deck/ActionDeckattack.webp';
import defendCard from '@/doc-types/mouseguard-assets/deck/ActionDeckdefend.webp';
import feintCard from '@/doc-types/mouseguard-assets/deck/ActionDeckfeint.webp';
import maneuverCard from '@/doc-types/mouseguard-assets/deck/ActionDeckmaneuver.webp';
import type { FormFieldReturnType } from '@/utils/form';
import { SelectField } from '@/components/form-fields/select-input/select-field';
import { useDocTypeTranslation } from '@/utils/api/hooks';

export const defaultNullActionChoice: FieldMapping<
	ActionChoice | null | undefined,
	ActionChoice | null
> = {
	toForm: (v) => v ?? null,
	fromForm: (v) => v ?? null,
};

export const cards: Record<ActionChoice, string> = {
	attack: attackCard,
	defend: defendCard,
	feint: feintCard,
	maneuver: maneuverCard,
};

export const cardChoices = [null, ...actionChoices];

export function displayChoice(
	item: ActionChoice | null,
	t: (key: string) => string,
) {
	return item ? (
		<img
			className="inline-block w-48"
			src={cards[item]}
			alt={t(`general.actions.${item}`)}
			title={t(`general.actions.${item}`)}
		/>
	) : (
		t('general.actions.not-selected')
	);
}

export function SelectAction({
	action,
}: {
	action: FormFieldReturnType<ActionChoice | null>;
}) {
	const t = useDocTypeTranslation('MouseGuard-Conflict');
	return (
		<SelectField
			field={action}
			items={cardChoices}
			selectInput={CardInput}
			children={(item) => displayChoice(item, t)}
		/>
	);
}

export function CardInput({
	value,
	className,
	onChange,
	onBlur,
	disabled,
	readOnly,
	children: renderChoice,
}: SelectInputProps<ActionChoice | null>) {
	const selected = useAtomValue(useAsAtom(value));
	const classNameValue = useAtomValue(useAsAtom(className));
	const disabledValue = useAtomValue(disabled);
	const readOnlyValue = useAtomValue(readOnly);

	return (
		<div
			className={twMerge('w-full', classNameValue)}
			onBlur={(event) => {
				if (event.currentTarget.contains(event.relatedTarget)) return;
				onBlur();
			}}
		>
			{readOnlyValue ? (
				<div
					className={twMerge(
						'relative w-full',
						'cursor-default',
						'bg-white dark:bg-slate-950',
						'py-2 pl-3 pr-10',
						'border-transparent border',
						'text-slate-950 dark:text-slate-50',
						'outline-none focus-visible:ring-2 ring-offset-transparent ring-offset-2 ring-transparent focus-visible:ring-blue-500 transition-all',
						'text-left sm:text-sm',
					)}
				>
					<span className="block truncate">{renderChoice(selected)}</span>
				</div>
			) : (
				<Listbox
					value={selected}
					onChange={(newValue) =>
						onChange({ currentTarget: { value: newValue } })
					}
					disabled={disabledValue}
				>
					<div className="relative">
						<Listbox.Button
							className={twMerge(
								'relative w-full',
								'cursor-default',
								'bg-white dark:bg-slate-950',
								'py-2 pl-3 pr-10',
								'border-slate-500 border',
								'disabled:text-opacity-75 disabled:border-slate-200 dark:disabled:border-slate-800 disabled:bg-slate-500/10',
								'text-slate-950 dark:text-slate-50',
								'shadow-md',
								'outline-none focus-visible:ring-2 ring-offset-transparent ring-offset-2 ring-transparent focus-visible:ring-blue-500 transition-all',
								'text-left sm:text-sm',
							)}
						>
							<span className="block truncate">{renderChoice(selected)}</span>
							<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<HiChevronUpDown
									className="h-5 w-5 text-slate-600 dark:text-slate-400"
									aria-hidden="true"
								/>
							</span>
						</Listbox.Button>
						<Transition
							as={Fragment}
							leave="transition ease-in duration-100"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<Listbox.Options
								className={twMerge(
									'fixed inset-0 h-full w-full z-modalForeground',
									'grid grid-cols-2 items-center justify-items-center content-center justify-center',
									'overflow-auto rounded-md border border-white dark:border-black bg-slate-100 dark:bg-slate-800',
									'py-1 text-base shadow-lg ring-1 ring-white dark:ring-black ring-opacity-5 focus:outline-none sm:text-sm z-dropdown',
								)}
							>
								{cardChoices.map((item, personIdx) => (
									<Listbox.Option
										key={personIdx}
										className={({ active }) =>
											twMerge(
												`relative cursor-default select-none py-2 pl-10 pr-4`,
												item === null ? 'col-span-2' : '',
												active
													? 'bg-white text-black dark:bg-slate-900 dark:text-white ring-1 ring-blue-200 dark:ring-blue-800'
													: 'text-slate-900 dark:text-slate-100',
											)
										}
										value={item}
									>
										{({ selected }) => (
											<>
												<span
													className={`block truncate ${
														selected ? 'font-bold' : 'font-normal'
													} text-2xl`}
												>
													{renderChoice(item)}
												</span>
												{selected ? (
													<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black dark:text-white">
														<HiCheck className="h-5 w-5" aria-hidden="true" />
													</span>
												) : null}
											</>
										)}
									</Listbox.Option>
								))}
							</Listbox.Options>
						</Transition>
					</div>
				</Listbox>
			)}
		</div>
	);
}
