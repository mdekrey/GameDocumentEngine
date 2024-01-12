import {
	constrain,
	type GameObjectWidgetDefinition,
	type GameObjectWidgetSettings,
	type Size,
	type WidgetSettings,
} from '@/documents/defineDocument';
import type { TypedDocumentDetails } from '@/documents/defineDocument';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useForm } from '@principlestudios/react-jotai-forms';
import { ButtonRow } from '@/components/button/button-row';
import { Button } from '@/components/button/button';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { useDocTypeTranslation } from '@/utils/api/hooks';
import type { TFunction } from 'i18next';
import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';
import { WidgetContainer } from './grid-utils';

export function WidgetSettingsForm<T, TWidget extends object>({
	document,
	widgetDefinition,
	translation,
	WidgetPreview,
	initialSettings,
	size,
	onSubmit,
}: {
	document: TypedDocumentDetails<T>;
	widgetDefinition: GameObjectWidgetDefinition<T, TWidget>;
	translation: TFunction;
	WidgetPreview: React.FC;
	initialSettings: WidgetSettings<TWidget>;
	size: Size;

	onSubmit: (newSettings: WidgetSettings<TWidget>, newSize: Size) => void;
}) {
	type SettingsField = FormFieldReturnType<WidgetSettings<TWidget>>;

	const widgetSettings = widgetDefinition.settings as GameObjectWidgetSettings<
		T,
		TWidget
	>;
	const t = useDocTypeTranslation('Dashboard', {
		keyPrefix: 'widget-settings',
	});
	const Settings = widgetSettings.component;

	const form = useForm({
		defaultValue: initialSettings,
		schema: widgetSettings.schema,
		translation,
		fields: {
			settings: [],
		},
	});
	const constrainedSize = useComputedAtom((get) => {
		return getSize(get(form.atom));
	});
	return (
		<div className="m-4">
			<form
				onSubmit={form.handleSubmit((value) => onSubmit(value, getSize(value)))}
			>
				<Fieldset>
					<Settings
						document={document}
						size={size}
						field={form.fields.settings as SettingsField}
					/>
					<SizedContainer size={constrainedSize}>
						<WidgetPreview />
					</SizedContainer>
					<ButtonRow>
						<Button type="submit">{t('submit')}</Button>
					</ButtonRow>
				</Fieldset>
			</form>
		</div>
	);

	function getSize(s: WidgetSettings<TWidget>) {
		return constrain(widgetDefinition, size, document, s);
	}
}

function SizedContainer({
	size,
	children,
}: {
	size: Atom<Size>;
	children?: React.ReactNode;
}) {
	return (
		<WidgetContainer size={useAtomValue(size)}>{children}</WidgetContainer>
	);
}
