import { Layout } from '@/components/layout/layout';

import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Profile } from '@/apps/profile/profile';
import { CreateGame } from './apps/create-game/create-game';
import { ListGamesLayout } from './apps/list-games/list-games';

function App() {
	return (
		<HashRouter future={{ v7_startTransition: true }}>
			<Layout>
				<Routes>
					<Route path="profile" Component={Profile} />
					<Route path="game/:id" element={<div>Here</div>} />
					<Route path="game" Component={ListGamesLayout} />
					<Route path="create-game" Component={CreateGame} />
					<Route path="/" element={<Navigate to="/games" />} />
				</Routes>
			</Layout>
		</HashRouter>
	);
}

export default App;
