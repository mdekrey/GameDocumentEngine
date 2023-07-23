import { queries } from '@/utils/api/queries';
import { useQuery } from '@tanstack/react-query';
import { useReducer } from 'react';
import { twMerge } from 'tailwind-merge';

import { HiOutlineDocumentText, HiBars3 } from 'react-icons/hi2';

export function Header({ children }: { children?: React.ReactNode }) {
	const userQuery = useQuery(queries.getCurrentUser);
	const [isMobileNavOpen, toggleIsMobileNavOpen] = useReducer((v) => !v, false);

	return (
		<div className="w-full md:w-64 bg-white p-6 border-b md:border-b-0 md:border-r border-gray-300">
			<div className="flex-none flex flex-row items-center w-full">
				<HiOutlineDocumentText />
				<strong className="capitalize ml-1 flex-1">Game Doc Engine</strong>

				<button
					id="sliderBtn"
					className="flex-none text-right text-gray-900 md:hidden block"
					title="menu"
					onClick={toggleIsMobileNavOpen}
				>
					<HiBars3 />
				</button>
			</div>

			<nav className={twMerge(isMobileNavOpen ? 'block' : 'hidden md:block')}>
				<hr className="my-3" />

				<ul>
					<li>
						{userQuery.isSuccess
							? `Hello, ${userQuery.data.name}!`
							: 'Signing in...'}
					</li>
					<li>
						<a href="#/game">Select Game</a>
					</li>
					<li>
						<a href="#/create-game">New Game</a>
					</li>
					<li>
						<a href="#/profile">View Profile</a>
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
