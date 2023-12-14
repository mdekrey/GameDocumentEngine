import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { Dashboard } from './types';
import { useTranslation } from 'react-i18next';
import type { Widget } from './types';
import type {
	GameTypeObjectScripts,
	GameTypeScripts,
} from '@/utils/api/queries/game-types';
import type { WidgetSettings } from '@/documents/defineDocument';
import type {
	GameObjectWidgetDefinition,
	TypedDocumentDetails,
	WidgetBase,
} from '@/documents/defineDocument';
import type { UserDetails } from '@/api/models/UserDetails';
import { useForm } from '@principlestudios/react-jotai-forms';
import { type TFunction } from 'i18next';
import type { z } from 'zod';
import { ErrorScreen } from '@/components/errors/ErrorScreen';
import { useQuery } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';

export function WidgetSettings({
	widgetId,
	document: dashboardDocument,
	docType: dashboardDocType,
	gameType,
	user,
}: GameObjectFormComponent<Dashboard> & { widgetId: string }) {
	const { t } = useTranslation('doc-types:Dashboard', {
		keyPrefix: 'widget-settings',
	});

	const widget = dashboardDocument.details.widgets[widgetId];
	const document = useQuery(
		queries.getDocument(dashboardDocument.gameId, widget.documentId),
	);
	const docType = document.data && gameType.objectTypes[document.data.type];
	const widgetDefinition = docType?.typeInfo.widgets?.[widget.widget];
	const { t: tWidget } = useTranslation(
		widgetDefinition?.translationNamespace ??
			`doc-types:${docType?.key ?? dashboardDocType.key}`,
		{
			keyPrefix: widgetDefinition?.translationKeyPrefix,
		},
	);

	if (!document.isSuccess) return 'Loading...';
	if (!widgetDefinition) return <ErrorScreen message={t('widget-not-found')} />;

	return (
		<>
			<WidgetSettingsComponent
				translation={tWidget}
				gameType={gameType}
				docType={docType}
				widgetDefinition={widgetDefinition}
				user={user}
				document={document.data}
				widget={widget}
			/>
		</>
	);
}

function WidgetSettingsComponent<T, TWidget extends WidgetBase>({
	translation,
	gameType,
	docType,
	widgetDefinition,
	user,
	document,
	widget,
}: {
	translation: TFunction;
	gameType: GameTypeScripts;
	docType: GameTypeObjectScripts<T>;
	widgetDefinition: GameObjectWidgetDefinition<T, TWidget>;
	user: UserDetails;
	document: TypedDocumentDetails<T>;
	widget: Widget<TWidget>;
}) {
	const Settings = widgetDefinition.settingsComponent;
	console.log(widgetDefinition);

	const form = useForm<WidgetSettings<TWidget>>({
		defaultValue: widget.settings,
		schema: widgetDefinition.settingsSchema as z.ZodType<
			WidgetSettings<TWidget>
		>,
		translation,
	});
	return (
		<>
			<Settings
				document={document}
				translation={translation}
				docType={docType}
				gameType={gameType}
				user={user}
				size={widget.position}
				field={form}
			/>
		</>
	);
}
