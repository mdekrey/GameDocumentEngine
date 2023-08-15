import { Menu } from '@headlessui/react';
import type { IconType } from 'react-icons';

export function HeaderMenuLink({
	icon: Icon,
	href,
	children,
}: {
	icon?: IconType;
	href: string;
	children: string;
}) {
	return (
		<Menu.Item>
			{({ active }) => (
				<a
					href={href}
					className={`${
						active ? 'bg-violet-500 text-brand-white' : 'text-brand-white'
					} group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2`}
				>
					<span className="w-4 h-4 flex-none">
						{Icon && <Icon className="w-4 h-4" />}
					</span>
					{children}
				</a>
			)}
		</Menu.Item>
	);
}
