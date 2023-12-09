import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { NoWidgets } from './NoWidgets';
import { AddWidgetModalForm } from './AddWidgetModalForm';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { IGameObjectType } from '@/documents/defineDocument';

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
	additional: { docTypeKey, widgets, icon, document },
}: ModalContentsProps<
	NewWidgetResult,
	{
		docTypeKey: string;
		widgets: IGameObjectType['widgets'];
		icon: IGameObjectType['icon'];
		document: DocumentDetails;
	}
>) {
	const { t: tDocument } = useTranslation(`doc-types:${docTypeKey}`);

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
