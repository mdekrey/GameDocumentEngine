import type {
	GameObjectFormComponent,
	GameObjectWidgetDefinition,
	GameObjectWidgetSettings,
} from '@/documents/defineDocument';
import type { WidgetTemplate } from './types';
import type { Widget } from './types';
import type { WidgetSettings } from '@/documents/defineDocument';
import type { TypedDocumentDetails } from '@/documents/defineDocument';
import { useForm } from '@principlestudios/react-jotai-forms';
import { Navigate, useNavigate } from 'react-router-dom';
import { WidgetContainer } from '@/doc-types/Dashboard/grid-utils';
import { ButtonRow } from '@/components/button/button-row';
import { Button } from '@/components/button/button';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { AtomContents } from '@/components/jotai/atom-contents';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { produce } from 'immer';
import {
	useDocTypeTranslation,
	useDocument,
	useTranslationFor,
	useWidgetType,
} from '@/utils/api/hooks';
import { useWidget } from './useWidget';

function constrain(
	size: { width: number; height: number },
	{ min, max }: ReturnType<GameObjectWidgetDefinition['getConstraints']>,
) {
	return {
		width: Math.max(min.width, Math.min(max?.width ?? size.width, size.width)),
		height: Math.max(
			min.height,
			Math.min(max?.height ?? size.height, size.height),
		),
	};
}

export function WidgetSettings({
	widgetId,
	document: widgetTemplateDocument,
	onSubmit,
	form,
	previewDocumentId,
}: GameObjectFormComponent<WidgetTemplate> & {
	widgetId: string;
	previewDocumentId: string;
}) {
	const widget = widgetTemplateDocument.details.widgets[widgetId];
	const document = useDocument(
		widgetTemplateDocument.gameId,
		previewDocumentId,
	);
	const widgetDefinition = useWidgetType(
		widgetTemplateDocument.gameId,
		previewDocumentId,
		widget.widget,
	);
	const navigate = useNavigate();

	if (!widgetDefinition.settings) return <Navigate to="../" />;

	return (
		<WidgetSettingsComponent
			document={document}
			widget={widget}
			previewDocumentId={previewDocumentId}
			onSubmit={(widgetValue) => {
				navigate('../');
				void onSubmit(
					produce(form.get(), (v) => {
						const widget = v.details.widgets[widgetId];
						widget.settings = widgetValue;
						const { width, height } = constrain(
							widget.position,
							widgetDefinition.getConstraints(widgetValue),
						);
						widget.position.width = width;
						widget.position.height = height;
					}),
				);
			}}
		/>
	);
}

function WidgetSettingsComponent<T, TWidget extends object>({
	document,
	widget,
	previewDocumentId,
	onSubmit,
}: {
	document: TypedDocumentDetails<T>;
	widget: Widget<TWidget>;
	previewDocumentId: string;
	onSubmit: (newSettings: WidgetSettings<TWidget>) => void;
}) {
	const previewDocument = useDocument(document.gameId, previewDocumentId);
	const widgetDefinition = useWidgetType(
		document.gameId,
		document.id,
		widget.widget,
	);
	const t = useDocTypeTranslation('WidgetTemplate', {
		keyPrefix: 'widget-settings',
	});
	const translation = useTranslationFor(
		document.gameId,
		document.id,
		widget.widget,
	);

	const settings = widgetDefinition.settings as GameObjectWidgetSettings<
		T,
		TWidget
	>;
	const Settings = settings.component;
	const Widget = useWidget(document.gameId, widget, previewDocument);

	const form = useForm<WidgetSettings<TWidget>>({
		defaultValue: widget.settings,
		schema: settings.schema,
		translation,
	});
	const widgetJsx = useComputedAtom((get) => {
		const settings = get(form.atom);
		const size = constrain(
			widget.position,
			widgetDefinition.getConstraints(settings),
		);
		return (
			<WidgetContainer size={size}>
				<Widget />
			</WidgetContainer>
		);
	});
	return (
		<div className="m-4">
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<Fieldset>
					<Settings document={document} size={widget.position} field={form} />
					<AtomContents>{widgetJsx}</AtomContents>
					<ButtonRow>
						<Button type="submit">{t('submit')}</Button>
					</ButtonRow>
				</Fieldset>
			</form>
		</div>
	);
}
