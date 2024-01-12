import type { Widget } from '../../types';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import type { ModalLauncher } from '@/utils/modal/modal-service';
import { produce } from 'immer';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import { areYouSure } from '@/utils/modal/layouts/are-you-sure-dialog';
import { useDocTypeTranslation, useTranslationFor } from '@/utils/api/hooks';

export async function deleteWidget(
	launchModal: ModalLauncher,
	gameId: string,
	previewDocument: DocumentDetails,
	widgetsField: FormFieldReturnType<Record<string, Widget>>,
	key: string,
) {
	const widget = widgetsField.getValue()[key];

	try {
		if (await areYouSure(launchModal, useTranslationParams)) applyChange();
	} catch (ex) {
		// On a cancel, do nothing
	}

	function applyChange() {
		widgetsField.onChange((prev) =>
			produce(prev, (widgets) => {
				delete widgets[key];
			}),
		);
	}

	function useTranslationParams() {
		const t = useDocTypeTranslation('WidgetTemplate', {
			keyPrefix: 'delete-widget-modal',
		});
		const tWidget = useTranslationFor(
			gameId,
			previewDocument.id,
			widget.widget,
		);
		return {
			t,
			values: { widgetType: tWidget('name') },
		};
	}
}
