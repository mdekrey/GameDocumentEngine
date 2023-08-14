import { Layout } from '@/components/layout/layout';

import {
	HashRouter,
	Navigate,
	Route,
	Routes,
	useMatch,
} from 'react-router-dom';
import { Profile } from '@/apps/profile/profile';
import { CreateGame } from './apps/create-game/create-game';
import { ListGames } from './apps/list-games/list-games';
import { GameDetails } from './apps/game-details/game-details';
import { GetParams } from './utils/routing/getParams';
import { CreateDocument } from './apps/documents/create-document/create-document';
import { DocumentDetails } from './apps/documents/details/doc-details';
import { GameEdit } from './apps/game-edit/game-edit';
import { GameInvites } from './apps/game-invites/game-invites';
import { GameRoles } from './apps/game-roles/game-roles';
import { DocumentRoles } from './apps/documents/document-roles/document-roles';

import '@/utils/i18n/setup';
import { useQuery } from '@tanstack/react-query';
import { queries } from './utils/api/queries';

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
	const gameMatch = useMatch('game/:gameId');
	const result = useQuery(
		gameMatch ? queries.getGameDetails(gameMatch.params.gameId ?? '') : {},
	);

	return (
		<Layout>
			{result.isSuccess && (
				<Layout.MenuTabs
					mainItem={{
						href: `#/game/${result.data.id}`,
						label: result.data.name,
					}}
					items={[]}
				/>
			)}
			<Routes>
				<Route path="profile/" Component={Profile} />
				<Route path="game/:gameId" Component={withGameId(GameDetails)} />
				<Route path="game/:gameId/edit" Component={withGameId(GameEdit)} />
				<Route path="game/:gameId/roles" Component={withGameId(GameRoles)} />
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
				<Route
					path="game/:gameId/document/:documentId/roles"
					Component={withDocumentId(withGameId(DocumentRoles))}
				/>
				<Route path="game/" Component={ListGames} />
				<Route path="create-game/" Component={CreateGame} />
				<Route path="/" element={<Navigate to="/game" />} />
			</Routes>
		</Layout>
	);
}

function AppProviders() {
	return (
		<HashRouter future={{ v7_startTransition: true }}>
			<App />
		</HashRouter>
	);
}

export default AppProviders;
