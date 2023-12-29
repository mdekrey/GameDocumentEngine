import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import { Prose } from '@/components/text/common';
import { Button } from '@/components/button/button';
import { Trans } from 'react-i18next';
import { NamedIcon } from '@/components/named-icon/NamedIcon';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import {
	useDocTypeTranslation,
	useDocument,
	useDocumentType,
	useTranslationFor,
} from '@/utils/api/hooks';
import { missingDocumentType } from '@/documents/defaultMissingWidgetDefinition';

export function NoWidgetsModal({
	additional: { gameId, documentId },
	reject,
}: ModalContentsProps<
	never,
	{
		gameId: string;
		documentId: string;
	}
>) {
	const document = useDocument(gameId, documentId);
	const { icon: Icon } =
		useDocumentType(gameId, documentId)?.typeInfo ?? missingDocumentType;
	const tDocument = useTranslationFor(gameId, documentId);
	const t = useDocTypeTranslation('Dashboard', {
		keyPrefix: 'adding-no-widgets',
	});

	return (
		<ModalDialogLayout>
			<ModalDialogLayout.Title>{t('title')}</ModalDialogLayout.Title>
			<Prose>
				<Trans
					i18nKey="intro"
					t={t}
					values={{ name: document.name }}
					components={{
						Document: (
							<NamedIcon
								name={document.name}
								icon={Icon}
								typeName={tDocument('name')}
							/>
						),
					}}
				/>
			</Prose>
			<ModalDialogLayout.Buttons>
				<Button.Secondary onClick={() => reject('Cancel')}>
					{t('cancel')}
				</Button.Secondary>
			</ModalDialogLayout.Buttons>
		</ModalDialogLayout>
	);
}
