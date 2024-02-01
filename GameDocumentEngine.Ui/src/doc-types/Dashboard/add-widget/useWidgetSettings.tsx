import { useCallback, useRef } from 'react';
import {
	constrain,
	type GameObjectWidgetDefinition,
	type WidgetSettings,
	type WidgetBase,
} from '@/documents/defineDocument';
import { useTranslationFor } from '@/utils/api/hooks';
import type { UseFormResult } from '@principlestudios/react-jotai-forms';
import { useForm } from '@principlestudios/react-jotai-forms';
import { z } from 'zod';
import type { DocumentDetails } from '@vaultvtt/api/openapi/models/DocumentDetails';
import { noop } from '@/utils/noop';
import type { NewWidgetResult } from './NewWidgetResult';

type HandleSubmit = UseFormResult<NewWidgetResult>['handleSubmit'];

export function useWidgetSettings<
	T = unknown,
	TWidget extends WidgetBase = void,
>({
	document,
	widgetType,
	widgetTypeKey,
}: {
	document: DocumentDetails;
	widgetType: GameObjectWidgetDefinition<T, TWidget>;
	widgetTypeKey: string;
}): { handleSubmit: HandleSubmit; component: React.FC } {
	const handleSubmit = useRef<HandleSubmit>(() => noop);
	return {
		handleSubmit: (cb) => handleSubmit.current(cb),
		component: useCallback(
			function WidgetSettings() {
				const t = useTranslationFor(
					document.gameId,
					document.id,
					widgetTypeKey,
				);

				const form = useForm({
					defaultValue: widgetType.settings?.default ?? {},
					translation: t,
					schema: widgetType.settings?.schema ?? z.object({}),
					fields: {
						settings: [],
					},
				});

				const Settings =
					widgetType.settings?.component ??
					function NoSettings() {
						return null;
					};
				handleSubmit.current = (callback) => (ev) =>
					form.handleSubmit((settings) =>
						callback({
							id: widgetTypeKey,
							size: constrain(
								widgetType,
								widgetType.defaults,
								document,
								settings as WidgetSettings<TWidget>,
							),
							settings,
						}),
					)(ev);

				return (
					<Settings
						document={document}
						size={widgetType.defaults}
						field={form.fields.settings}
					/>
				);
			},
			[document, widgetType, widgetTypeKey],
		),
	};
}
