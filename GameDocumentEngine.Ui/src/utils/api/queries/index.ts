import { getInfo } from './environment';
import { getCurrentUser, patchUser } from './user';
import type operations from '@/api/operations';
import {
	createGame,
	deleteGame,
	patchGame,
	getGameDetails,
	listGameTypes,
	listGames,
	removePlayerFromGame,
	getGameExport,
	importGame,
} from './games';
import {
	getDocument,
	listDocuments,
	createDocument,
	deleteDocument,
	patchDocument,
	changeDocumentFolder,
} from './document';
import { getGameType } from './game-types';
import { listInvitations, createInvitation, cancelInvitation } from './invites';
import { updateGameRoleAssignments } from './game-roles';
import { updateDocumentRoleAssignments } from './document-roles';

export const queries = {
	getInfo,
	/** Intentionally not supporting `getTranslationData` here */
	getTranslationData: null,
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
	removePlayerFromGame,
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
	getGameExport,
	importGame,
} satisfies { [K in keyof typeof operations]: unknown };
export const extraQueries = {
	changeDocumentFolder,
};
