import '@/utils/api/queries';
import { useReducer } from 'react';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { WidgetTemplate } from '../types';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { WidgetTemplateViewMode } from './WidgetTemplateViewMode';
import { WidgetTemplateEditMode } from './WidgetTemplateEditMode';
import { useDocument } from '@/utils/api/hooks';

export function MainDisplay({
	document,
	form,
	writablePointers,
	onSubmit,
	previewDocumentId,
}: GameObjectFormComponent<WidgetTemplate> & { previewDocumentId: string }) {
	const previewDocument = useDocument(document.gameId, previewDocumentId);
	const canUpdateWidgets = writablePointers.contains('details', 'widgets');
	useSubmitOnChange(form, onSubmit);
	const [editing, toggleEditing] = useReducer(
		canUpdateWidgets ? (prev) => !prev : () => false,
		false,
	);
	const { widgets } = useFormFields(form, {
		widgets: ['details', 'widgets'],
	});

	return editing ? (
		<WidgetTemplateEditMode
			document={document}
			previewDocument={previewDocument}
			widgets={widgets}
			onToggleEditing={toggleEditing}
		/>
	) : (
		<WidgetTemplateViewMode
			document={document}
			previewDocument={previewDocument}
			widgets={widgets}
			canUpdateWidgets={canUpdateWidgets}
			onToggleEditing={toggleEditing}
		/>
	);
}
