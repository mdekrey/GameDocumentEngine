import { Suspense } from 'react';
import type { TypedDocumentDetails } from '@/documents/defineDocument';
import type { Dashboard, Widget } from './types';
import { documentIdMimeType, useDropTarget } from '@/components/drag-drop';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { DashboardContainer, PositionedWidgetContainer } from './grid-utils';
import { RenderWidget } from './RenderWidget';
import { IconButton } from '@/components/button/icon-button';
import { HiPencil } from 'react-icons/hi2';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import { useDocTypeTranslation } from '@/utils/api/hooks';
import { ErrorScreen } from '@/components/errors';
import { useWidgetSizes } from './useWidgetSizes';

export function DashboardViewMode({
	document,
	widgets,
	canUpdateWidgets,
	onToggleEditing,
}: {
	document: TypedDocumentDetails<Dashboard>;
	widgets: FormFieldReturnType<Record<string, Widget>>;
	canUpdateWidgets: boolean;
	onToggleEditing: () => void;
}) {
	const { dashboardHeight, dashboardWidth } = useWidgetSizes(widgets.atom);
	const dropTarget = useDropTarget({
		[documentIdMimeType]: {
			canHandle({ link }) {
				if (!canUpdateWidgets) return false;
				if (!link) return false;
				onToggleEditing();
				return 'link';
			},
			handle(ev, data) {
				if (data.gameId !== document.gameId) return false;
				onToggleEditing();
				return false;
			},
		},
	});
	const t = useDocTypeTranslation('Dashboard');

	return (
		<DashboardContainer
			{...dropTarget}
			style={{ ['--h']: dashboardHeight, ['--w']: dashboardWidth }}
		>
			{Object.entries(document.details.widgets).map(
				([key, config]: [string, Widget]) => (
					<PositionedWidgetContainer key={key} position={config.position}>
						<ErrorBoundary
							errorKey={JSON.stringify(config)}
							fallback={
								<ErrorScreen message={t('widgets.widget-runtime-error')} />
							}
						>
							<Suspense>
								<RenderWidget gameId={document.gameId} widgetConfig={config} />
							</Suspense>
						</ErrorBoundary>
					</PositionedWidgetContainer>
				),
			)}
			<div className="fixed right-4 bottom-4">
				{canUpdateWidgets && (
					<IconButton onClick={onToggleEditing}>
						<HiPencil />
					</IconButton>
				)}
			</div>
		</DashboardContainer>
	);
}
