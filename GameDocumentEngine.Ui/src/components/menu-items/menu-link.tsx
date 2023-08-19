import { Menu } from '@headlessui/react';
import type { IconType } from 'react-icons';

export function MenuLink({
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
						active ? 'outline outline-blue-700 text-white' : 'text-white'
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
