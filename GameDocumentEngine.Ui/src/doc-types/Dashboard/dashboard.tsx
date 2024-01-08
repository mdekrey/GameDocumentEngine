import '@/utils/api/queries';
import { useReducer } from 'react';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { Dashboard } from './types';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { DashboardViewMode } from './DashboardViewMode';
import { DashboardEditMode } from './DashboardEditMode';

export function DashboardDisplay({
	document,
	form,
	writablePointers,
	onSubmit,
}: GameObjectFormComponent<Dashboard>) {
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
		<DashboardEditMode
			document={document}
			widgets={widgets}
			onToggleEditing={toggleEditing}
		/>
	) : (
		<DashboardViewMode
			document={document}
			widgets={widgets}
			canUpdateWidgets={canUpdateWidgets}
			onToggleEditing={toggleEditing}
		/>
	);
}
