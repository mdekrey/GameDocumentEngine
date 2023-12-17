import type {
	GameObjectFormComponent,
	GameObjectWidgetSettings,
} from '@/documents/defineDocument';
import type { Dashboard } from './types';
import { useTranslation } from 'react-i18next';
import type { Widget } from './types';
import type { GameTypeObjectScripts } from '@/utils/api/queries/game-types';
import type { WidgetSettings } from '@/documents/defineDocument';
import type {
	GameObjectWidgetDefinition,
	TypedDocumentDetails,
} from '@/documents/defineDocument';
import { useForm } from '@principlestudios/react-jotai-forms';
import { Navigate, useNavigate } from 'react-router-dom';
import { WidgetContainer } from './grid-utils';
import { ButtonRow } from '@/components/button/button-row';
import { Button } from '@/components/button/button';
import type { TFunction } from 'i18next';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { AtomContents } from '@/components/jotai/atom-contents';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { produce } from 'immer';
import { useDocument, useDocumentType, useWidgetType } from '@/utils/api/hooks';

export function WidgetSettings({
	widgetId,
	document: dashboardDocument,
	onSubmit,
	form,
}: GameObjectFormComponent<Dashboard> & { widgetId: string }) {
	const { t } = useTranslation('doc-types:Dashboard', {
		keyPrefix: 'widget-settings',
	});

	const widget = dashboardDocument.details.widgets[widgetId];
	const document = useDocument(dashboardDocument.gameId, widget.documentId);
	const docType = useDocumentType(dashboardDocument.gameId, widget.documentId);
	const widgetDefinition = useWidgetType(
		dashboardDocument.gameId,
		widget.documentId,
		widget.widget,
	);
	const navigate = useNavigate();

	if (!widgetDefinition.settings) return <Navigate to="../" />;

	return (
		<>
			<WidgetSettingsComponent
				docType={docType}
				widgetDefinition={widgetDefinition}
				document={document}
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
	docType,
	widgetDefinition,
	document,
	widget,
	t,
	onSubmit,
}: {
	docType: GameTypeObjectScripts<T>;
	widgetDefinition: GameObjectWidgetDefinition<T, TWidget>;
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
			size={widget.position}
			widgetSettings={get(form.atom)}
			widgetType={widget.widget}
		/>
	));
	return (
		<div className="m-4">
			<WidgetContainer size={widget.position}>
				<AtomContents>{widgetJsx}</AtomContents>
			</WidgetContainer>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<Fieldset>
					<Settings document={document} size={widget.position} field={form} />
					<ButtonRow>
						<Button type="submit">{t('submit')}</Button>
					</ButtonRow>
				</Fieldset>
			</form>
		</div>
	);
}
