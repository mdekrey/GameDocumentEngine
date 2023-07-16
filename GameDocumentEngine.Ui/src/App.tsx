import { Layout } from '@/components/layout/layout';

import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Profile } from '@/apps/profile/profile';
import { CreateGame } from './apps/create-game/create-game';
import { ListGames } from './apps/list-games/list-games';
import { GameObjects } from './apps/game-details/game-objects';
import { GameDetails } from './apps/game-details/game-details';
import { GetParams } from './utils/routing/getParams';
import { CreateDocument } from './apps/documents/create-document/create-document';

function withGameId<T extends { gameId: string }>(
	Component: React.ComponentType<T>,
): React.ComponentType<Omit<T, 'gameId'>> {
	return (props: Omit<T, 'gameId'>) => (
		<GetParams>
			{({ gameId }: { gameId: string }) => (
				<Component {...({ ...props, gameId } as T)} />
			)}
		</GetParams>
	);
}

function App() {
	return (
		<HashRouter future={{ v7_startTransition: true }}>
			<Layout>
				<Layout.Sidebar>
					<Routes>
						<Route path="game/:gameId/*" Component={withGameId(GameObjects)} />
					</Routes>
				</Layout.Sidebar>
				<Routes>
					<Route path="profile/" Component={Profile} />
					<Route path="game/:gameId" Component={withGameId(GameDetails)} />
					<Route
						path="game/:gameId/create-document"
						Component={withGameId(CreateDocument)}
					/>
					<Route path="game/" Component={ListGames} />
					<Route path="create-game/" Component={CreateGame} />
					<Route path="/" element={<Navigate to="/game" />} />
				</Routes>
			</Layout>
		</HashRouter>
	);
}

export default App;
