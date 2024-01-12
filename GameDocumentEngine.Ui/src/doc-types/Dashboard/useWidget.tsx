import type { WidgetBase, WidgetSettings } from '@/documents/defineDocument';
import type { Widget } from './types';
import { useDocument, useWidgetType } from '@/utils/api/hooks';
import { useAsAtom } from '@principlestudios/jotai-react-signals';
import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';
import { useCallback } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useWidget<T = unknown, TWidget extends WidgetBase = any>(
	gameId: string,
	widgetConfig: Widget,
) {
	const document = useDocument(gameId, widgetConfig.documentId);
	const { component: Component } = useWidgetType<T, TWidget>(
		gameId,
		widgetConfig.documentId,
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
					document={document}
					widgetType={widgetConfig.widget}
					size={widgetConfig.position}
					widgetSettings={s as WidgetSettings<TWidget>}
				/>
			);
		},
		[Component, document, widgetConfig],
	);
}
