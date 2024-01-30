import { getDocumentType } from '@/utils/api/accessors';
import { useGame, useGameType } from '@/utils/api/hooks';
import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';

export function useCreateDocumentDetails<T>(
	documentTypeAtom: Atom<string>,
	gameId: string,
) {
	const disabled = useComputedAtom((get) => !get(documentTypeAtom));
	const documentTypeName = useAtomValue(documentTypeAtom);
	const gameDetails = useGame(gameId);
	const gameType = useGameType(gameId);
	const docType = getDocumentType<T>(gameType, documentTypeName);

	return { disabled, gameDetails, docType };
}
