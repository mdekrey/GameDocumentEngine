import { Button } from '@/components/button/button';
import { Prose } from '@/components/text/common';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import type { Widget } from '../types';
import { NamedIcon } from '@/components/named-icon/NamedIcon';
import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import type { WidgetBase } from '@/documents/defineDocument';
import { WidgetContainer } from '../grid-utils';
import {
	useDocTypeTranslation,
	useDocument,
	useDocumentType,
	useTranslationFor,
	useWidgetType,
} from '@/utils/api/hooks';
import { missingDocumentType } from '@/documents/defaultMissingWidgetDefinition';

export function InfoWidgetModal<TWidget extends WidgetBase>({
	resolve,
	additional: { gameId, widget },
}: ModalContentsProps<
	void,
	{
		gameId: string;
		widget: Widget<TWidget>;
	}
>) {
	const document = useDocument(gameId, widget.documentId);
	const { icon: Icon } =
		useDocumentType(gameId, widget.documentId)?.typeInfo ?? missingDocumentType;
	const Component = useWidgetType(
		gameId,
		widget.documentId,
		widget.widget,
	).component;
	const t = useDocTypeTranslation('Dashboard');
	const tDocument = useTranslationFor(gameId, widget.documentId);
	const tWidget = useTranslationFor(gameId, widget.documentId, widget.widget);
	// TODO: better layout
	return (
		<ModalDialogLayout>
			<ModalDialogLayout.Title>
				{t('info-widget-modal.title')}
			</ModalDialogLayout.Title>
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
				<Button onClick={() => resolve()}>{t('info-widget-modal.ok')}</Button>
			</ModalDialogLayout.Buttons>
		</ModalDialogLayout>
	);
}
