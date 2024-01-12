import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { WidgetTemplate } from './types';
import { useAtomValue } from 'jotai';
import { useDocTypeTranslation } from '@/utils/api/hooks';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@principlestudios/react-jotai-forms';
import { z } from 'zod';
import { ButtonRow } from '@/components/button/button-row';
import { Button } from '@/components/button/button';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { SelectDocumentByType } from './SelectDocumentByType';

export function SelectPreviewItem({
	document,
	form,
}: GameObjectFormComponent<WidgetTemplate>) {
	const navigate = useNavigate();
	const t = useDocTypeTranslation('WidgetTemplate', {
		keyPrefix: 'select-preview-document',
	});
	const docType = useAtomValue(form.field(['details', 'docType']).atom);
	const selectionForm = useForm({
		defaultValue: '',
		schema: z.string().min(1),
		translation: t,
		fields: {
			selection: [],
		},
	});
	return (
		<form onSubmit={selectionForm.handleSubmit(onSubmit)}>
			<Fieldset>
				<SelectDocumentByType
					gameId={document.gameId}
					docType={docType}
					field={selectionForm.fields.selection}
				/>
				<ButtonRow>
					<Button type="submit">{t('submit')}</Button>
				</ButtonRow>
			</Fieldset>
		</form>
	);

	function onSubmit(previewDocumentId: string) {
		navigate(`preview/${previewDocumentId}`);
	}
}
