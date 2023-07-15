import { getCurrentUser, patchUser } from './user';
import operations from '@/api/operations';
import {
	createGame,
	deleteGame,
	getGameDetails,
	listGameTypes,
	listGames,
} from './games';
import { getDocument } from './document';

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
	listDocuments: null,
	createDocument: null,
	getDocument,
	deleteDocument: null,
	patchDocument: null,
} satisfies { [K in keyof typeof operations]: unknown };
