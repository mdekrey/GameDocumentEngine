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
import { useNetworkIndicator } from '@/components/network/useNetworkIndicator';
import { useHeader } from '@/components/header/useHeaderMenuItems';

import '@/utils/i18n/setup';
import { GameObjects } from './apps/game-details/game-objects';
import { GameSubheader } from './apps/game-details/game-subheader';
import { GameSettings } from './apps/game-settings/game-settings';
import { DocumentSubheader } from './apps/documents/subheader/document-subheader';
import { Suspense } from 'react';
import { withParamsValue } from '@/components/router/withParamsValue';

const withGameId = withParamsValue('gameId');
const withDocumentId = withParamsValue('documentId');

const mainRoute: RouteObject[] = [
	{ path: 'profile/', Component: Profile },
	{ path: 'game/:gameId', Component: withGameId(GameDetails) },
	{ path: 'game/:gameId/settings', Component: withGameId(GameSettings) },
	{
		path: 'game/:gameId/invites',
		Component: withGameId(GameInvites),
	},
	{
		path: 'game/:gameId/create-document',
		Component: withGameId(CreateDocument),
	},
	{
		path: 'game/:gameId/document/:documentId/*',
		Component: withDocumentId(withGameId(DocumentDetails)),
	},
	{
		path: 'game/:gameId/document/:documentId/settings',
		Component: withDocumentId(withGameId(DocumentSettings)),
	},
	{ path: 'game/', Component: ListGames },
	{ path: 'create-game/', Component: CreateGame },
	{ path: '/', element: <Navigate to="/game" /> },
];

const leftSidebarRoute: RouteObject[] = [
	{ path: 'game/:gameId/*', Component: withGameId(GameObjects) },
	// while not having a matched route causes a console warning, even if the route gives a null element the `useRoutes` will not return null
];

const subheaderRoutes: RouteObject[] = [
	{ path: 'game/:gameId/*', Component: withGameId(GameSubheader) },
	{
		path: 'game/:gameId/document/:documentId/*',
		Component: withDocumentId(withGameId(DocumentSubheader)),
	},
];

function LoadingSection({ children }: { children?: React.ReactNode }) {
	return <Suspense fallback={<>Loading...</>}>{children}</Suspense>;
}

function App() {
	const networkIndicator = useNetworkIndicator();
	const header = useHeader();
	const subheaderRoute = useRoutes(subheaderRoutes);
	const leftSidebar = useRoutes(leftSidebarRoute);

	return (
		<Layout {...header} {...networkIndicator}>
			{subheaderRoute ? (
				<Layout.Subheader>
					<LoadingSection>{subheaderRoute}</LoadingSection>
				</Layout.Subheader>
			) : null}
			<LoadingSection>{useRoutes(mainRoute)}</LoadingSection>
			{leftSidebar ? (
				<Layout.LeftSidebar>
					<LoadingSection>{leftSidebar}</LoadingSection>
				</Layout.LeftSidebar>
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
