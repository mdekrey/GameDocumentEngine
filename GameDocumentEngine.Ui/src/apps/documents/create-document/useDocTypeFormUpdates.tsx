import type { UseFormResultWithFields } from '@/utils/form';
import type { z } from 'zod';
import { getDocumentType } from '@/utils/api/accessors';
import { useGame, useGameType } from '@/utils/api/hooks';
import { useAtomSubscription } from '../../../utils/useAtomSubscription';
import type { createDocumentDetailsSchema } from './createDocumentDetailsSchema';

export function useDocTypeFormUpdates(
	gameId: string,
	form: UseFormResultWithFields<z.infer<typeof createDocumentDetailsSchema>>,
) {
	const gameDetails = useGame(gameId);
	const gameType = useGameType(gameId);

	useAtomSubscription(form.field(['type']).value, (docTypeName) => {
		const docType = getDocumentType(gameType, docTypeName);
		form.set((prev) => {
			return {
				...prev,
				initialRoles: Object.fromEntries(
					Object.entries(gameDetails.players)
						.filter(
							([playerId]) => playerId !== gameDetails.currentUserPlayerId,
						)
						.map(([playerId]) => [
							playerId,
							(docType?.userRoles.includes(prev.initialRoles[playerId])
								? prev.initialRoles[playerId]
								: '') ?? '',
						]),
				),
				details: (docType?.typeInfo.template ?? {}) as typeof prev.details,
			};
		});
	});
}
