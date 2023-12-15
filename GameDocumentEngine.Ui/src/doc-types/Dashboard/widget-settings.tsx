import type {
	GameObjectFormComponent,
	GameObjectWidgetSettings,
} from '@/documents/defineDocument';
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
} from '@/documents/defineDocument';
import type { UserDetails } from '@/api/models/UserDetails';
import { useForm } from '@principlestudios/react-jotai-forms';
import { ErrorScreen } from '@/components/errors/ErrorScreen';
import { useQuery } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import { Navigate, useNavigate } from 'react-router-dom';
import { WidgetContainer } from './grid-utils';
import { ButtonRow } from '@/components/button/button-row';
import { Button } from '@/components/button/button';
import type { TFunction } from 'i18next';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { AtomContents } from '@/components/jotai/atom-contents';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { produce } from 'immer';

export function WidgetSettings({
	widgetId,
	document: dashboardDocument,
	gameType,
	user,
	onSubmit,
	form,
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
	const navigate = useNavigate();

	if (!document.isSuccess) return 'Loading...';
	if (!widgetDefinition) return <ErrorScreen message={t('widget-not-found')} />;
	if (!widgetDefinition.settings) return <Navigate to="../" />;

	return (
		<>
			<WidgetSettingsComponent
				gameType={gameType}
				docType={docType}
				widgetDefinition={widgetDefinition}
				user={user}
				document={document.data}
				widget={widget}
				t={t}
				onSubmit={(widgetValue) => {
					navigate('../');
					void onSubmit(
						produce(form.get(), (v) => {
							v.details.widgets[widgetId].settings = widgetValue;
						}),
					);
				}}
			/>
		</>
	);
}

function WidgetSettingsComponent<T, TWidget extends object>({
	gameType,
	docType,
	widgetDefinition,
	user,
	document,
	widget,
	t,
	onSubmit,
}: {
	gameType: GameTypeScripts;
	docType: GameTypeObjectScripts<T>;
	widgetDefinition: GameObjectWidgetDefinition<T, TWidget>;
	user: UserDetails;
	document: TypedDocumentDetails<T>;
	widget: Widget<TWidget>;
	t: TFunction;
	onSubmit: (newSettings: WidgetSettings<TWidget>) => void;
}) {
	const { t: translation } = useTranslation(
		widgetDefinition.translationNamespace ?? `doc-types:${docType.key}`,
		{
			keyPrefix: widgetDefinition.translationKeyPrefix,
		},
	);

	const settings = widgetDefinition.settings as GameObjectWidgetSettings<
		T,
		TWidget
	>;
	const Settings = settings.component;
	const Component = widgetDefinition.component;

	const form = useForm<WidgetSettings<TWidget>>({
		defaultValue: widget.settings,
		schema: settings.schema,
		translation: translation,
	});
	const widgetJsx = useComputedAtom((get) => (
		<Component
			document={document}
			translation={translation}
			user={user}
			gameType={gameType}
			docType={docType}
			size={widget.position}
			widgetSettings={get(form.atom)}
		/>
	));
	return (
		<div className="m-4">
			<WidgetContainer size={widget.position}>
				<AtomContents>{widgetJsx}</AtomContents>
			</WidgetContainer>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<Fieldset>
					<Settings
						document={document}
						translation={translation}
						docType={docType}
						gameType={gameType}
						user={user}
						size={widget.position}
						field={form}
					/>
					<ButtonRow>
						<Button type="submit">{t('submit')}</Button>
					</ButtonRow>
				</Fieldset>
			</form>
		</div>
	);
}
