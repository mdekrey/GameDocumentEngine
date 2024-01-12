import type { GameObjectWidgetDefinition } from '@/documents/defineDocument';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import {
	NotSelected,
	SelectField,
} from '@/components/form-fields/select-input/select-field';
import { WidgetName } from './WidgetName';

export function SelectWidgetTypeField({
	widgets,
	field,
	docTypeKey,
}: {
	widgets: Record<string, GameObjectWidgetDefinition>;
	field: FormFieldReturnType<string>;
	docTypeKey: string;
}) {
	const widgetKeys = widgets ? Object.keys(widgets) : [];

	return (
		<SelectField field={field} items={widgetKeys}>
			{(dt) =>
				dt ? (
					<WidgetName target={widgets[dt]} docTypeKey={docTypeKey} />
				) : (
					<NotSelected>{field.translation('not-selected')}</NotSelected>
				)
			}
		</SelectField>
	);
}
