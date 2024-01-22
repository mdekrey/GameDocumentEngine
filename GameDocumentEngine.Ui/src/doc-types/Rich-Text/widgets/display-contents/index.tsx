import type {
	GameObjectWidgetDefinition,
	WidgetComponentProps,
	WidgetSettingsComponentProps,
} from '@/documents/defineDocument';
import type { RichText } from '../../types';
import { DisplayRichText } from '@/components/rich-text';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { z } from 'zod';
import { CheckboxField } from '@/components/form-fields/checkbox-input/checkbox-field';

export function ContentsDisplay({
	document,
	widgetSettings,
}: WidgetComponentProps<RichText, ContentsWidgetOptions>) {
	return (
		<div className="w-full h-full overflow-auto">
			{widgetSettings.displayName ? (
				<h1 className="mb-2 text-5xl font-bold">{document.name}</h1>
			) : null}
			<DisplayRichText data={document.details.mdx ?? ''} />
		</div>
	);
}

type ContentsWidgetOptions = {
	displayName: boolean;
};
function ContentsSettings({
	field,
}: WidgetSettingsComponentProps<RichText, ContentsWidgetOptions>) {
	const fields = useFormFields(field, {
		displayName: { path: ['displayName'] as const },
	});
	return <CheckboxField field={fields.displayName} />;
}

export const RichTextContentsWidgetDefinition: GameObjectWidgetDefinition<
	RichText,
	ContentsWidgetOptions
> = {
	component: ContentsDisplay,
	defaults: { width: 12, height: 12 },
	translationKeyPrefix: '',
	getConstraints() {
		return { min: { width: 2, height: 2 } };
	},
	settings: {
		schema: z.object({
			displayName: z.boolean(),
		}),
		component: ContentsSettings,
		default: { displayName: false },
	},
};
