import type { FormFieldReturnType } from '@/utils/form';
import { useFormFields } from '@/utils/form';
import type { WidgetTemplate } from './types';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import {
	NotSelected,
	SelectField,
} from '@/components/form-fields/select-input/select-field';
import { useGameType } from '@/utils/api/hooks';
import { Trans } from 'react-i18next';
import { getDocTypeTranslationNamespace } from '@/utils/api/accessors';

export function CreateWidgetTemplate({
	gameId,
	templateField,
}: {
	gameId: string;
	templateField: FormFieldReturnType<WidgetTemplate>;
}) {
	const gameType = useGameType(gameId);
	const formFields = useFormFields(templateField, {
		type: ['docType'],
	});
	return (
		<Fieldset>
			<SelectField
				field={formFields.type}
				items={Object.keys(gameType.objectTypes)}
			>
				{(key) =>
					key ? (
						<Trans ns={getDocTypeTranslationNamespace(key)} i18nKey={'name'} />
					) : (
						<NotSelected>
							{formFields.type.translation('not-selected')}
						</NotSelected>
					)
				}
			</SelectField>
		</Fieldset>
	);
}
