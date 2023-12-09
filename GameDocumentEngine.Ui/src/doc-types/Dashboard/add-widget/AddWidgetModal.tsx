import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useGameType } from '@/apps/documents/useGameType';
import { useQuery } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import { NoWidgets } from './NoWidgets';
import { AddWidgetModalForm } from './AddWidgetModalForm';

export type NewWidgetResult = {
	id: string;
	defaults: {
		width: number;
		height: number;
	};
};
export const newWidgetSchema = z.object({
	id: z.string().min(1),
});

export function AddWidgetModal({
	resolve,
	reject,
	additional: { gameId, id },
}: ModalContentsProps<NewWidgetResult, { gameId: string; id: string }>) {
	const gameType = useGameType(gameId);
	const droppingDoc = useQuery(queries.getDocument(gameId, id));

	const key =
		droppingDoc.data?.type &&
		gameType.data?.objectTypes[droppingDoc.data?.type]?.key;
	const { t: objT } = useTranslation(`doc-types:${key ?? 'unknown'}`);

	if (!gameType.isSuccess || !droppingDoc.isSuccess) return 'Loading...';

	const objScripts = gameType.data.objectTypes[droppingDoc.data.type].typeInfo;
	console.log(objScripts);

	if (!objScripts.widgets || !Object.keys(objScripts.widgets).length) {
		return (
			<NoWidgets
				dropped={droppingDoc.data}
				tDocument={objT}
				icon={objScripts.icon}
				reject={reject}
			/>
		);
	}

	return (
		<AddWidgetModalForm
			dropped={droppingDoc.data}
			tDocument={objT}
			icon={objScripts.icon}
			widgets={objScripts.widgets}
			resolve={resolve}
			reject={reject}
		/>
	);
}
