import { Menu } from '@headlessui/react';
import type { IconType } from 'react-icons';

export function MenuLink({
	icon: Icon,
	children,
	...rest
}: {
	icon?: IconType;
	children: string;
} & (
	| {
			href: string;
	  }
	| { onClick: () => void }
)) {
	return (
		<Menu.Item>
			{({ active }) => {
				const className = `${
					active ? 'outline outline-blue-300 dark:outline-blue-700' : ''
				} text-black dark:text-white group flex w-full items-center rounded-md px-2 py-2 text-sm gap-2`;
				const contents = (
					<>
						<span className="w-4 h-4 flex-none">
							{Icon && <Icon className="w-4 h-4" />}
						</span>
						{children}
					</>
				);
				return 'href' in rest ? (
					<a href={rest.href} className={className}>
						{contents}
					</a>
				) : (
					<button onClick={rest.onClick} className={className}>
						{contents}
					</button>
				);
			}}
		</Menu.Item>
	);
}
