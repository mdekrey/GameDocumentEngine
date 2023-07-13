import { Layout } from '@/components/layout/layout';

import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Profile } from '@/apps/profile/profile';
import { CreateGame } from './apps/create-game/create-game';
import { ListGames } from './apps/list-games/list-games';
import { GameObjects } from './apps/game-details/game-objects';
import { GameDetails } from './apps/game-details/game-details';

function App() {
	return (
		<HashRouter future={{ v7_startTransition: true }}>
			<Layout>
				<Layout.Sidebar>
					<Routes>
						<Route path="game/:id/*" Component={GameObjects} />
					</Routes>
				</Layout.Sidebar>
				<Routes>
					<Route path="profile/" Component={Profile} />
					<Route path="game/:id" Component={GameDetails} />
					<Route path="game/" Component={ListGames} />
					<Route path="create-game/" Component={CreateGame} />
					<Route path="/" element={<Navigate to="/game" />} />
				</Routes>
			</Layout>
		</HashRouter>
	);
}

export default App;
