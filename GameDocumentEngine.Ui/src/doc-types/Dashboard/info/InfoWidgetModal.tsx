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
import type {
	GameObjectWidgetDefinition,
	TypedDocumentDetails,
	WidgetBase,
} from '@/documents/defineDocument';
import type { UserDetails } from '@/api/models/UserDetails';

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
	// TODO: better layout
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
			<ModalDialogLayout.Buttons>
				<Button onClick={() => resolve()}>{t('ok')}</Button>
			</ModalDialogLayout.Buttons>
		</ModalDialogLayout>
	);
}
