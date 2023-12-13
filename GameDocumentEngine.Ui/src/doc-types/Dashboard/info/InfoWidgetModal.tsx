import { Button } from '@/components/button/button';
import { Prose } from '@/components/text/common';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useTranslation } from 'react-i18next';
import type { IconType } from 'react-icons';
import type { Widget } from '../types';
import { NamedIcon } from '@/components/named-icon/NamedIcon';
import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
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
import type { TFunction } from 'i18next';
import type { z } from 'zod';

export function InfoWidgetModal<T, TWidget extends WidgetBase>({
	resolve,
	additional: {
		gameType,
		docType,
		widgetDefinition,
		user,
		document,
		widget,
		icon: Icon,
	},
}: ModalContentsProps<
	void,
	{
		gameType: GameTypeScripts;
		docType: GameTypeObjectScripts<T>;
		widgetDefinition: GameObjectWidgetDefinition<T, TWidget>;
		user: UserDetails;
		document: TypedDocumentDetails<T>;
		widget: Widget<TWidget>;
		icon: IconType;
	}
>) {
	const { t } = useTranslation('doc-types:Dashboard', {
		keyPrefix: 'info-widget-modal',
	});
	const { t: tDocument } = useTranslation(`doc-types:${docType.key}`);
	const { t: tWidget } = useTranslation(
		widgetDefinition.translationNamespace ?? `doc-types:${docType.key}`,
		{
			keyPrefix: widgetDefinition.translationKeyPrefix,
		},
	);
	const Component = widgetDefinition.component;
	return (
		<ModalDialogLayout>
			<ModalDialogLayout.Title>{t('title')}</ModalDialogLayout.Title>
			<Prose>
				{tWidget('name')}{' '}
				<NamedIcon
					name={document.name}
					icon={Icon}
					typeName={tDocument('name')}
				/>
			</Prose>
			<Component
				document={document}
				translation={tWidget}
				docType={docType}
				gameType={gameType}
				user={user}
				size={widget.position}
				widgetSettings={widget.settings}
			/>
			<WidgetSettingsComponent<T, TWidget>
				translation={tWidget}
				gameType={gameType}
				docType={docType}
				widgetDefinition={widgetDefinition}
				user={user}
				document={document}
				widget={widget}
			/>
			<ModalDialogLayout.Buttons>
				<Button onClick={() => resolve()}>{t('ok')}</Button>
			</ModalDialogLayout.Buttons>
		</ModalDialogLayout>
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
