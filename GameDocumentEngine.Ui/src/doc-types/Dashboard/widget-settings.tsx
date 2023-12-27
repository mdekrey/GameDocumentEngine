import type {
	GameObjectFormComponent,
	GameObjectWidgetDefinition,
	GameObjectWidgetSettings,
} from '@/documents/defineDocument';
import type { Dashboard } from './types';
import type { Widget } from './types';
import type { WidgetSettings } from '@/documents/defineDocument';
import type { TypedDocumentDetails } from '@/documents/defineDocument';
import { useForm } from '@principlestudios/react-jotai-forms';
import { Navigate, useNavigate } from 'react-router-dom';
import { WidgetContainer } from './grid-utils';
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
	document: dashboardDocument,
	onSubmit,
	form,
}: GameObjectFormComponent<Dashboard> & { widgetId: string }) {
	const widget = dashboardDocument.details.widgets[widgetId];
	const document = useDocument(dashboardDocument.gameId, widget.documentId);
	const widgetDefinition = useWidgetType(
		dashboardDocument.gameId,
		widget.documentId,
		widget.widget,
	);
	const navigate = useNavigate();

	if (!widgetDefinition.settings) return <Navigate to="../" />;

	return (
		<WidgetSettingsComponent
			document={document}
			widget={widget}
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
	onSubmit,
}: {
	document: TypedDocumentDetails<T>;
	widget: Widget<TWidget>;
	onSubmit: (newSettings: WidgetSettings<TWidget>) => void;
}) {
	const widgetDefinition = useWidgetType(
		document.gameId,
		document.id,
		widget.widget,
	);
	const t = useDocTypeTranslation('Dashboard', {
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
	const Component = widgetDefinition.component;

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
				<Component
					document={document}
					size={widget.position}
					widgetSettings={settings}
					widgetType={widget.widget}
				/>
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
