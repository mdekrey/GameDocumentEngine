import { Layout } from '@/components/layout/layout';

import type { RouteObject } from 'react-router-dom';
import { HashRouter, Navigate, useRoutes } from 'react-router-dom';
import { Profile } from '@/apps/profile/profile';
import { CreateGame } from './apps/create-game/create-game';
import { ListGames } from './apps/list-games/list-games';
import { GameDetails } from './apps/game-details/game-details';
import { CreateDocument } from './apps/documents/create-document/create-document';
import { DocumentDetails } from './apps/documents/details/doc-details';
import { GameInvites } from './apps/game-settings/game-invites/game-invites';
import { DocumentSettings } from './apps/documents/document-settings/document-settings';

import '@/utils/i18n/setup';
import { GameObjectsSidebar } from './apps/game-details/game-objects';
import { GameSubheader } from './apps/game-details/game-subheader';
import { GameSettings } from './apps/game-settings/game-settings';
import { DocumentSubheader } from './apps/documents/subheader/document-subheader';
import { withParamsValue } from '@/components/router/withParamsValue';
import { withErrorBoundary } from '@/components/router/withErrorBoundary';
import { useHeaderPresentation } from './components/header/useHeaderPresentation';
import { useReconnectOnLoad } from './components/network/useReconnectOnLoad';

const withGameId = withParamsValue('gameId');
const withDocumentId = withParamsValue('documentId');

const mainRoute: RouteObject[] = [
	{ path: 'profile/', Component: withErrorBoundary(Profile) },
	{
		path: 'game/:gameId',
		Component: withErrorBoundary(withGameId(GameDetails)),
	},
	{
		path: 'game/:gameId/settings',
		Component: withErrorBoundary(withGameId(GameSettings)),
	},
	{
		path: 'game/:gameId/invites',
		Component: withErrorBoundary(withGameId(GameInvites)),
	},
	{
		path: 'game/:gameId/create-document',
		Component: withErrorBoundary(withGameId(CreateDocument)),
	},
	{
		path: 'game/:gameId/document/:documentId/*',
		Component: withErrorBoundary(withDocumentId(withGameId(DocumentDetails))),
	},
	{
		path: 'game/:gameId/document/:documentId/settings',
		Component: withErrorBoundary(withDocumentId(withGameId(DocumentSettings))),
	},
	{ path: 'game/', Component: withErrorBoundary(ListGames) },
	{ path: 'create-game/', Component: withErrorBoundary(CreateGame) },
	{ path: '/', element: <Navigate to="/game" replace={true} /> },
];

const leftSidebarRoute: RouteObject[] = [
	{
		path: 'game/:gameId/*',
		Component: withErrorBoundary(withGameId(GameObjectsSidebar)),
	},
	// while not having a matched route causes a console warning, even if the route gives a null element the `useRoutes` will not return null
];

const subheaderRoutes: RouteObject[] = [
	{
		path: 'game/:gameId/*',
		Component: withErrorBoundary(withGameId(GameSubheader)),
	},
	{
		path: 'game/:gameId/document/:documentId/*',
		Component: withErrorBoundary(withDocumentId(withGameId(DocumentSubheader))),
	},
];

function App() {
	useReconnectOnLoad();
	const header = useHeaderPresentation();
	const subheaderRoute = useRoutes(subheaderRoutes);
	const leftSidebar = useRoutes(leftSidebarRoute);

	return (
		<Layout
			header={header}
			subheader={subheaderRoute}
			leftSidebar={leftSidebar}
		>
			{useRoutes(mainRoute)}
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
