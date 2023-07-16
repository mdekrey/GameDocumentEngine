import { getCurrentUser, patchUser } from './user';
import operations from '@/api/operations';
import {
	createGame,
	deleteGame,
	getGameDetails,
	listGameTypes,
	listGames,
} from './games';
import {
	getDocument,
	listDocuments,
	createDocument,
	deleteDocument,
	patchDocument,
} from './document';
import { getGameType } from './game-types';

export const queries = {
	getCurrentUser,
	patchUser,
	listGameTypes,
	listGames,
	login: null,
	createGame,
	getGameDetails,
	deleteGame,
	patchGame: null,
	getGameType,
	listDocuments,
	createDocument,
	getDocument,
	deleteDocument,
	patchDocument,
} satisfies { [K in keyof typeof operations]: unknown };
