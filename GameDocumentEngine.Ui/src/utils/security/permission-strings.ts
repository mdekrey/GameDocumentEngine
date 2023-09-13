export const viewGame = (gameId: string) => `game:${gameId}:read`;
export const deleteGame = (gameId: string) => `game:${gameId}:delete`;
export const updateGame = (gameId: string) => `game:${gameId}:update`;
export const createDocument = (gameId: string) =>
	`game:${gameId}:create-document`;
export const updateGameUserAccess = (gameId: string) =>
	`game:${gameId}:change-permissions`;
export const listInvitations = (gameId: string) =>
	`game:${gameId}:invitations:list`;
export const createInvitation = (gameId: string, role: string) =>
	`game:${gameId}:invitations:create:role-${role}`;
export const cancelInvitation = (gameId: string) =>
	`game:${gameId}:invitations:cancel`;

export const baseDocument = (gameId: string, documentId: string) =>
	`game:${gameId}:document:${documentId}`;
export const deleteDocument = (gameId: string, documentId: string) =>
	`${baseDocument(gameId, documentId)}:delete`;
export const updateDocumentUserAccess = (gameId: string, documentId: string) =>
	`${baseDocument(gameId, documentId)}:change-permissions`;
export const updateDocumentAccessForSelf = (
	gameId: string,
	documentId: string,
) => `${baseDocument(gameId, documentId)}:change-my-permissions`;

export const writeDocumentDetailsPrefix = (
	gameId: string,
	documentId: string,
) => `${baseDocument(gameId, documentId)}:details:write`;

export const readDocumentDetailsPrefix = (gameId: string, documentId: string) =>
	`${baseDocument(gameId, documentId)}:details:read`;
