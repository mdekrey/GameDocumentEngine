import { Menu } from '@headlessui/react';

export function HeaderMenuLink({
	href,
	children,
}: {
	href: string;
	children: string;
}) {
	return (
		<Menu.Item>
			{({ active }) => (
				<a
					href={href}
					className={`${
						active ? 'bg-violet-500 text-white' : 'text-gray-900'
					} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
				>
					{children}
				</a>
			)}
		</Menu.Item>
	);
}
