import { Layout } from '@/components/layout/layout';

import { HashRouter, Navigate, useRoutes, RouteObject } from 'react-router-dom';
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
import { useNetworkIndicator } from '@/components/network/useNetworkIndicator';
import { useHeader } from '@/components/header/useHeaderMenuItems';

import '@/utils/i18n/setup';
import { GameObjects } from './apps/game-details/game-objects';

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

const mainRoute: RouteObject[] = [
	{ path: 'profile/', Component: Profile },
	{ path: 'game/:gameId', Component: withGameId(GameDetails) },
	{ path: 'game/:gameId/edit', Component: withGameId(GameEdit) },
	{ path: 'game/:gameId/roles', Component: withGameId(GameRoles) },
	{
		path: 'game/:gameId/invites',
		Component: withGameId(GameInvites),
	},
	{
		path: 'game/:gameId/create-document',
		Component: withGameId(CreateDocument),
	},
	{
		path: 'game/:gameId/document/:documentId',
		Component: withDocumentId(withGameId(DocumentDetails)),
	},
	{
		path: 'game/:gameId/document/:documentId/roles',
		Component: withDocumentId(withGameId(DocumentRoles)),
	},
	{ path: 'game/', Component: ListGames },
	{ path: 'create-game/', Component: CreateGame },
	{ path: '/', element: <Navigate to="/game" /> },
];

const leftSidebarRoute: RouteObject[] = [
	{ path: 'game/:gameId/*', Component: withGameId(GameObjects) },
];

function App() {
	const networkIndicator = useNetworkIndicator();
	const header = useHeader();
	const leftSidebar = useRoutes(leftSidebarRoute);

	return (
		<Layout {...header} {...networkIndicator}>
			{useRoutes(mainRoute)}
			{leftSidebar ? (
				<Layout.LeftSidebar>{leftSidebar}</Layout.LeftSidebar>
			) : null}
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
