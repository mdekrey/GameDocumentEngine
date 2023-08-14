import { Fragment } from 'react';
import { Atom, useAtomValue } from 'jotai';
import { twMerge } from 'tailwind-merge';
import { useAsAtom } from '@principlestudios/jotai-react-signals';
import { ControlledHtmlProps } from '@/utils/form/useField';
import { Listbox, Transition } from '@headlessui/react';
import { HiCheck, HiChevronUpDown } from 'react-icons/hi2';

export type SelectInputProps<T> = {
	disabled?: Atom<boolean>;
	className?: string | Atom<string>;
	items: T[];
	children: (item: T) => React.ReactNode;
} & ControlledHtmlProps<T>;

export function SelectInput<T>({
	value,
	className,
	items,
	onChange,
	onBlur,
	children,
	disabled,
}: SelectInputProps<T>) {
	const selected = useAtomValue(useAsAtom(value));
	const classNameValue = useAtomValue(useAsAtom(className));
	const disabledValue = useAtomValue(useAsAtom(disabled));

	return (
		<div
			className={twMerge('w-full', classNameValue)}
			onBlur={(event) => {
				if (event.currentTarget.contains(event.relatedTarget)) return;
				onBlur();
			}}
		>
			<Listbox
				value={selected}
				onChange={(newValue) =>
					onChange({ currentTarget: { value: newValue } })
				}
				disabled={disabledValue}
			>
				<div className="relative mt-1">
					<Listbox.Button
						className={twMerge(
							'relative w-full',
							'cursor-default border-gray-500 border bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm',
						)}
					>
						<span className="block truncate">{children(selected)}</span>
						<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
							<HiChevronUpDown
								className="h-5 w-5 text-gray-400"
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
						<Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-dropdown">
							{items.map((item, personIdx) => (
								<Listbox.Option
									key={personIdx}
									className={({ active }) =>
										`relative cursor-default select-none py-2 pl-10 pr-4 ${
											active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
										}`
									}
									value={item}
								>
									{({ selected }) => (
										<>
											<span
												className={`block truncate ${
													selected ? 'font-medium' : 'font-normal'
												}`}
											>
												{children(item)}
											</span>
											{selected ? (
												<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
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
		</div>
	);
}