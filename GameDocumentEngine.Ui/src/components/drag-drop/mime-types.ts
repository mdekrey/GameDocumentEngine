export const documentIdMimeType = 'application/x-vault-vtt-doc-id';
export const widgetMimeType = 'application/x-vault-vtt-widget';
export const userIdMimeType = 'application/x-vault-vtt-user-id';
export type DraggingMimeTypes = {
	[documentIdMimeType]: { gameId: string; id: string };
	[widgetMimeType]: {
		gameId: string;
		documentId: string;
		widget: string;
	};
	[userIdMimeType]: { userId: string };
};

export const allMimeTypes = [
	documentIdMimeType,
	widgetMimeType,
	userIdMimeType,
] as const satisfies ReadonlyArray<keyof DraggingMimeTypes>;

// If an error occurs on the following line, it means not all mime types are in the `allMimeTypes` array
true satisfies Exclude<
	keyof DraggingMimeTypes,
	(typeof allMimeTypes)[number]
> extends never
	? true
	: false;
// If an error occurs on the following line, it means not all mime types are in the DraggingMimeTypes type
true satisfies Exclude<
	(typeof allMimeTypes)[number],
	keyof DraggingMimeTypes
> extends never
	? true
	: false;
