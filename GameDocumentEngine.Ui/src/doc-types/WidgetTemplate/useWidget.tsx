import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type { Widget } from './types';
import { useWidgetType } from '@/utils/api/hooks';
import { useCallback } from 'react';
import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';
import type { WidgetBase, WidgetSettings } from '@/documents/defineDocument';
import { useAsAtom } from '@principlestudios/jotai-react-signals';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useWidget<T = unknown, TWidget extends WidgetBase = any>(
	previewDocument: DocumentDetails,
	widgetConfig: Widget,
) {
	const { component: Component } = useWidgetType<T, TWidget>(
		previewDocument.gameId,
		previewDocument.id,
		widgetConfig.widget,
	);
	return useCallback(
		function Widget({
			settings,
		}: {
			settings?: Atom<WidgetSettings<TWidget>> | WidgetSettings<TWidget>;
		}) {
			const s = useAtomValue(useAsAtom(settings ?? widgetConfig.settings));
			return (
				<Component
					document={previewDocument}
					widgetType={widgetConfig.widget}
					size={widgetConfig.position}
					widgetSettings={s as WidgetSettings<TWidget>}
				/>
			);
		},
		[Component, previewDocument, widgetConfig],
	);
}
