import { Button } from '@/components/button/button';
import { Prose } from '@/components/text/common';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useTranslation } from 'react-i18next';
import type { IconType } from 'react-icons';
import type { Widget } from '../types';
import { NamedIcon } from '@/components/named-icon/NamedIcon';
import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import type { GameTypeObjectScripts } from '@/utils/api/queries/game-types';
import type {
	GameObjectWidgetDefinition,
	TypedDocumentDetails,
	WidgetBase,
} from '@/documents/defineDocument';
import type { UserDetails } from '@/api/models/UserDetails';
import { WidgetContainer } from '../grid-utils';
import { useTranslationForDocument } from '@/utils/api/hooks';

export function InfoWidgetModal<T, TWidget extends WidgetBase>({
	resolve,
	additional: { docType, widgetDefinition, document, widget, icon: Icon },
}: ModalContentsProps<
	void,
	{
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
	const tWidget = useTranslationForDocument(document, widget.widget);
	const Component = widgetDefinition.component;
	// TODO: better layout
	return (
		<ModalDialogLayout>
			<ModalDialogLayout.Title>{t('title')}</ModalDialogLayout.Title>
			<div className="flex flex-row-reverse flex-wrap justify-end gap-4">
				<Prose>
					<NamedIcon
						name={document.name}
						icon={Icon}
						typeName={tDocument('name')}
					/>
					<br />
					{tWidget('name')}
				</Prose>
				<WidgetContainer size={widget.position}>
					<Component
						document={document}
						size={widget.position}
						widgetSettings={widget.settings}
						widgetType={widget.widget}
					/>
				</WidgetContainer>
			</div>
			<ModalDialogLayout.Buttons>
				<Button onClick={() => resolve()}>{t('ok')}</Button>
			</ModalDialogLayout.Buttons>
		</ModalDialogLayout>
	);
}
