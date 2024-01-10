import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { Dashboard } from './types';
import { Route, Routes } from 'react-router-dom';
import { WidgetSettingsContainer } from './widget-settings';
import { withParamsValue } from '@/components/router/withParamsValue';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import { DashboardViewMode } from './DashboardViewMode';
import { DashboardEditMode } from './DashboardEditMode';

const withWidgetId = withParamsValue('widgetId');

const InternalWidgetSettings = withWidgetId(WidgetSettingsContainer);

export function DashboardRouter(props: GameObjectFormComponent<Dashboard>) {
	useSubmitOnChange(props.form, props.onSubmit);

	return (
		<Routes>
			<Route
				path="widget/:widgetId"
				element={<InternalWidgetSettings {...props} />}
			/>
			<Route path="edit" element={<DashboardEditMode {...props} />} />
			<Route path="" element={<DashboardViewMode {...props} />} />
		</Routes>
	);
}
