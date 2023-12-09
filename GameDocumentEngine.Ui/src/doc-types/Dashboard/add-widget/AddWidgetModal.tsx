import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { NoWidgets } from './NoWidgets';
import { AddWidgetModalForm } from './AddWidgetModalForm';
import type { GameTypeObjectScripts } from '@/utils/api/queries/game-types';
import type { DocumentDetails } from '@/api/models/DocumentDetails';

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
	additional: { docType, document },
}: ModalContentsProps<
	NewWidgetResult,
	{ docType: GameTypeObjectScripts; document: DocumentDetails }
>) {
	const { t: tDocument } = useTranslation(`doc-types:${docType.key}`);
	const { widgets, icon } = docType.typeInfo;

	const commonProps = {
		document,
		tDocument,
		icon,
		resolve,
		reject,
	};

	if (!widgets || !Object.keys(widgets).length)
		return <NoWidgets {...commonProps} />;

	return <AddWidgetModalForm {...commonProps} widgets={widgets} />;
}
