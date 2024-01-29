import type { GameObjectWidgetDefinition } from '@/documents/defineDocument';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { Trans } from 'react-i18next';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { SelectWidgetTypeField } from './SelectWidgetTypeField';
import type { TFunction } from 'i18next';
import { ModalForm } from '@/utils/modal/modal-form';

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
	const title = (
		<Trans i18nKey="title" t={t} components={{ Document: <DocumentName /> }} />
	);
	return (
		<ModalForm
			title={title}
			onSubmit={() => onSubmit()}
			onCancel={onCancel}
			translation={t}
		>
			<Fieldset>
				<SelectWidgetTypeField
					field={widgetTypeField}
					widgets={widgets}
					docTypeKey={docTypeKey}
				/>
				<WidgetSettings />
			</Fieldset>
		</ModalForm>
	);
}
