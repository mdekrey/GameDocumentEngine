import type { Widget } from '../types';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import type { useLaunchModal } from '@/utils/modal/modal-service';
import { produce } from 'immer';
import { areYouSure } from '@/utils/modal/layouts/are-you-sure-dialog';
import { useDocTypeTranslation, useTranslationFor } from '@/utils/api/hooks';
import { useDocumentName } from '@/components/named-icon/useDocumentName';

export async function deleteWidget(
	launchModal: ReturnType<typeof useLaunchModal>,
	gameId: string,
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
		const DocumentName = useDocumentName(gameId, widget.documentId);
		const t = useDocTypeTranslation('Dashboard', {
			keyPrefix: 'delete-widget-modal',
		});
		const tWidget = useTranslationFor(gameId, widget.documentId, widget.widget);
		return {
			t,
			values: { widgetType: tWidget('name') },
			components: {
				Target: <DocumentName />,
			},
		};
	}
}
