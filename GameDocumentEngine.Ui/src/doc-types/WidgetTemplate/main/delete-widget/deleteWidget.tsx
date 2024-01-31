import type { Widget } from '../../types';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { produce } from 'immer';
import { useAreYouSure } from '@/utils/modal/layouts/are-you-sure-dialog';
import { useTranslationFor } from '@/utils/api/hooks';
import { useCallback } from 'react';
import { getDocTypeTranslationNamespace } from '@/utils/api/accessors';

export function useDeleteWidget(
	gameId: string,
	documentId: string,
	widgetsField: FormFieldReturnType<Record<string, Widget>>,
) {
	const Target = useCallback(
		function WidgetTarget(props: { widgetType: string }) {
			return useTranslationFor(gameId, documentId, props.widgetType)('name');
		},
		[gameId, documentId],
	);
	const areYouSure = useAreYouSure(
		[
			getDocTypeTranslationNamespace('WidgetTemplate'),
			{
				keyPrefix: 'delete-widget-modal',
			},
		],
		Target,
	);

	return (id: string) => () => void onDelete(id);
	async function onDelete(id: string) {
		const widgetType = widgetsField.getValue()[id].widget;
		const confirm = await areYouSure({ widgetType }).catch(() => false);
		if (confirm)
			widgetsField.onChange((prev) =>
				produce(prev, (widgets) => {
					delete widgets[id];
				}),
			);
	}
}
