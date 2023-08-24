import type { HiHome } from 'react-icons/hi2';
import { Tab } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';

export type TabConfig = {
	key: number | string;
	icon: typeof HiHome;
	title: string;
	content: JSX.Element;
};

export type TabProps = {
	tabs: TabConfig[];
};

export function Tabs({ tabs }: TabProps) {
	return (
		<div className="w-full">
			<Tab.Group>
				<Tab.List className="flex gap-x-1 rounded-xl dark:bg-slate-900 bg-slate-50 p-1">
					{tabs.map(({ key, icon: Icon, title }) => (
						<Tab
							key={key}
							className={({ selected }) =>
								twMerge(
									'flex flex-col flex-1 items-center',
									'rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 dark:text-blue-300',
									'ring-white dark:ring-slate-950 ring-opacity-60 ring-offset-2 ring-offset-blue-400 dark:ring-offset-blue-600 focus:outline-none focus:ring-2',
									selected
										? 'bg-white dark:bg-slate-950 shadow'
										: 'text-slate-400 dark:text-slate-600 hover:bg-slate-950/[0.12] dark:hover:bg-white/[0.12] hover:text-slate-800 dark:hover:text-slate-200',
								)
							}
						>
							<Icon className="h-8 w-8" />
							<span className="text-xs">{title}</span>
						</Tab>
					))}
				</Tab.List>
				<Tab.Panels className="mt-2">
					{tabs.map(({ key, content }) => (
						<Tab.Panel
							key={key}
							className={twMerge(
								'rounded-xl bg-white dark:bg-slate-950 p-3',
								'ring-white dark:ring-slate-950 ring-opacity-60 ring-offset-2 ring-offset-blue-400 dark:ring-offset-blue-600 focus:outline-none focus:ring-2',
							)}
						>
							{content}
						</Tab.Panel>
					))}
				</Tab.Panels>
			</Tab.Group>
		</div>
	);
}
