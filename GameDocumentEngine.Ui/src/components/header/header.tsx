import { currentUserQuery } from '@/utils/api';
import { useQuery } from '@tanstack/react-query';
import { useReducer } from 'react';
import { twMerge } from 'tailwind-merge';

import { HiOutlineDocumentText, HiMenu } from 'react-icons/hi';

export function Header({ children }: { children?: React.ReactNode }) {
	const { data } = useQuery({ ...currentUserQuery() });
	const [isMobileNavOpen, toggleIsMobileNavOpen] = useReducer((v) => !v, false);

	return (
		<div className="fixed md:static w-full md:w-64 bg-white p-6 border-b md:border-b-0 md:border-r border-gray-300">
			<div className="flex-none flex flex-row items-center w-full">
				<HiOutlineDocumentText />
				<strong className="capitalize ml-1 flex-1">Game Doc Engine</strong>

				<button
					id="sliderBtn"
					className="flex-none text-right text-gray-900 md:hidden block"
					title="menu"
					onClick={toggleIsMobileNavOpen}
				>
					<HiMenu />
				</button>
			</div>

			<nav className={twMerge(isMobileNavOpen ? 'block' : 'hidden md:block')}>
				<hr className="my-3" />

				<ul>
					<li>Hello, {data?.data.name}!</li>
					<li>
						<a href="/games">Select Game</a>
					</li>
					<li>
						<a href="">New Game</a>
					</li>
					<li>
						<a href="">View Profile</a>
					</li>
				</ul>

				{children && (
					<>
						<hr className="my-3" />
						{children}
					</>
				)}
			</nav>
		</div>
	);
}
