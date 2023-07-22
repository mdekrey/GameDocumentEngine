import { getCurrentUser, patchUser } from './user';
import operations from '@/api/operations';
import {
	createGame,
	deleteGame,
	patchGame,
	getGameDetails,
	listGameTypes,
	listGames,
	removeUserFromGame,
} from './games';
import {
	getDocument,
	listDocuments,
	createDocument,
	deleteDocument,
	patchDocument,
} from './document';
import { getGameType } from './game-types';
import { listInvitations, createInvitation, cancelInvitation } from './invites';
import { getGameRoles, updateGameRoleAssignments } from './game-roles';

export const queries = {
	getCurrentUser,
	patchUser,
	listGameTypes,
	listGames,
	login: null,
	createGame,
	getGameType,
	getGameDetails,
	deleteGame,
	patchGame,
	getGameRoles,
	updateGameRoleAssignments,
	removeUserFromGame,
	listDocuments,
	createDocument,
	getDocument,
	deleteDocument,
	patchDocument,
	listInvitations,
	createInvitation,
	claimInvitation: null,
	cancelInvitation,
} satisfies { [K in keyof typeof operations]: unknown };
