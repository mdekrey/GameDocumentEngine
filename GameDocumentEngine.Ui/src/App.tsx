import { Layout } from '@/components/layout/layout';

import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Profile } from '@/apps/profile/profile';
import { CreateGame } from './apps/create-game/create-game';
import { ListGames } from './apps/list-games/list-games';
import { GameObjects } from './apps/game-details/game-objects';
import { GameDetails } from './apps/game-details/game-details';
import { GetParams } from './utils/routing/getParams';
import { CreateDocument } from './apps/documents/create-document/create-document';
import { DocumentDetails } from './apps/documents/details/doc-details';
import { RealtimeApiProvider } from './utils/api/realtime';
import { GameEdit } from './apps/game-edit/game-edit';
import { GameInvites } from './apps/game-invites/game-invites';
import { GameRoles } from './apps/game-roles/game-roles';

function withParamsValue<const T extends string>(prop: T) {
	return <TProps extends { [P in T]: string }>(
		Component: React.ComponentType<TProps>,
	): React.ComponentType<Omit<TProps, T>> => {
		return (props: Omit<TProps, T>) => (
			<GetParams>
				{(params: { [P in T]: string }) => (
					<Component {...({ ...props, [prop]: params[prop] } as TProps)} />
				)}
			</GetParams>
		);
	};
}

const withGameId = withParamsValue('gameId');
const withDocumentId = withParamsValue('documentId');

function App() {
	return (
		<RealtimeApiProvider>
			<HashRouter future={{ v7_startTransition: true }}>
				<Layout>
					<Layout.Sidebar>
						<Routes>
							<Route
								path="game/:gameId/*"
								Component={withGameId(GameObjects)}
							/>
						</Routes>
					</Layout.Sidebar>
					<Routes>
						<Route path="profile/" Component={Profile} />
						<Route path="game/:gameId" Component={withGameId(GameDetails)} />
						<Route path="game/:gameId/edit" Component={withGameId(GameEdit)} />
						<Route
							path="game/:gameId/roles"
							Component={withGameId(GameRoles)}
						/>
						<Route
							path="game/:gameId/invites"
							Component={withGameId(GameInvites)}
						/>
						<Route
							path="game/:gameId/create-document"
							Component={withGameId(CreateDocument)}
						/>
						<Route
							path="game/:gameId/document/:documentId"
							Component={withDocumentId(withGameId(DocumentDetails))}
						/>
						<Route path="game/" Component={ListGames} />
						<Route path="create-game/" Component={CreateGame} />
						<Route path="/" element={<Navigate to="/game" />} />
					</Routes>
				</Layout>
			</HashRouter>
		</RealtimeApiProvider>
	);
}

export default App;
