import type { GameObjectWidgetDefinition } from '@/documents/defineDocument';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import { Trans } from 'react-i18next';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { Button } from '@/components/button/button';
import { SelectWidgetTypeField } from './SelectWidgetTypeField';
import type { TFunction } from 'i18next';

export function AddWidgetModalPresentation({
	docTypeKey,
	widgets,
	widgetTypeField,
	DocumentName,
	WidgetSettings,
	t,
	onCancel,
	onSubmit,
}: {
	docTypeKey: string;
	widgets: Record<string, GameObjectWidgetDefinition>;
	widgetTypeField: FormFieldReturnType<string>;
	DocumentName: React.FC;
	WidgetSettings: React.FC;
	t: TFunction;
	onCancel: () => void;
	onSubmit: () => void;
}) {
	return (
		<form onSubmit={() => onSubmit()}>
			<ModalDialogLayout>
				<ModalDialogLayout.Title>
					<Trans
						i18nKey="title"
						t={t}
						components={{
							Document: <DocumentName />,
						}}
					/>
				</ModalDialogLayout.Title>
				<Fieldset>
					<SelectWidgetTypeField
						field={widgetTypeField}
						widgets={widgets}
						docTypeKey={docTypeKey}
					/>
					<WidgetSettings />
				</Fieldset>

				<ModalDialogLayout.Buttons>
					<Button.Save type="submit">{t('submit')}</Button.Save>
					<Button.Secondary onClick={onCancel}>{t('cancel')}</Button.Secondary>
				</ModalDialogLayout.Buttons>
			</ModalDialogLayout>
		</form>
	);
}
