import { getCurrentUser, patchUser } from './user';
import type operations from '@/api/operations';
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
import { updateGameRoleAssignments } from './game-roles';
import { updateDocumentRoleAssignments } from './document-roles';

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
	updateGameRoleAssignments,
	removeUserFromGame,
	listDocuments,
	createDocument,
	getDocument,
	deleteDocument,
	patchDocument,
	updateDocumentRoleAssignments,
	listInvitations,
	createInvitation,
	claimInvitation: null,
	cancelInvitation,
} satisfies { [K in keyof typeof operations]: unknown };
