export const baseDocument = (gameId: string, documentId: string) =>
	`game:${gameId}:document:${documentId}`;

export const writeDocumentDetailsPrefix = (
	gameId: string,
	documentId: string,
) => `${baseDocument(gameId, documentId)}:details:write`;
