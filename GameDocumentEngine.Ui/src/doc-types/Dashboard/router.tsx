import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { Dashboard } from './types';
import { Route, Routes } from 'react-router-dom';
import { DashboardDisplay } from './dashboard';
import { WidgetSettings } from './widget-settings';
import { withParamsValue } from '@/components/router/withParamsValue';

const withWidgetId = withParamsValue('widgetId');

const InternalWidgetSettings = withWidgetId(WidgetSettings);

export function DashboardRouter(props: GameObjectFormComponent<Dashboard>) {
	return (
		<Routes>
			<Route
				path="widget/:widgetId"
				element={<InternalWidgetSettings {...props} />}
			/>
			<Route path="" element={<DashboardDisplay {...props} />} />
		</Routes>
	);
}
