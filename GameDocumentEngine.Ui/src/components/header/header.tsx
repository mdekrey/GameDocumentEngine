import { queries } from '@/utils/api/queries';
import { useQuery } from '@tanstack/react-query';
import { useReducer } from 'react';
import { twMerge } from 'tailwind-merge';

import { HiOutlineDocumentText, HiMenu } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

export function Header({ children }: { children?: React.ReactNode }) {
	const navigate = useNavigate();
	const userQuery = useQuery(queries.getCurrentUser);
	if (userQuery.data?.isFirstTime) {
		navigate('/profile');
	}
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
					<HiMenu />
				</button>
			</div>

			<nav className={twMerge(isMobileNavOpen ? 'block' : 'hidden md:block')}>
				<hr className="my-3" />

				{userQuery.isSuccess ? (
					<ul>
						<li>Hello, {userQuery.data?.name}!</li>
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
				) : (
					<span>TODO Loading...</span>
				)}

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
