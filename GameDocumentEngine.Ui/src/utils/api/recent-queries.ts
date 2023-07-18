const recentMessageIds = new Set<string>();

export function addMessageId(messageId: string) {
	console.log({ messageId });
	recentMessageIds.add(messageId);
	setTimeout(() => recentMessageIds.delete(messageId), 10000);
}

export function isMessageIdReceived(messageId: string) {
	return recentMessageIds.has(messageId);
}
