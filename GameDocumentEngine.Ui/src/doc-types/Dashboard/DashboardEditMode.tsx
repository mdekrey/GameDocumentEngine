import type { TypedDocumentDetails } from '@/documents/defineDocument';
import type { Dashboard, Widget } from './types';
import {
	documentIdMimeType,
	isDraggingAtom,
	useDropTarget,
} from '@/components/drag-drop';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { useLaunchModal } from '@/utils/modal/modal-service';
import { addWidget } from './add-widget/addWidget';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardContainer, toGridCoordinate } from './grid-utils';
import { IconButton } from '@/components/button/icon-button';
import { HiCheck } from 'react-icons/hi2';
import { deleteWidget } from './delete-widget/deleteWidget';
import { showWidgetInfo } from './info/info';
import { useWidgetSizes } from './useWidgetSizes';
import { RenderWidget } from './RenderWidget';
import { MoveResizeWidget } from './MoveResizeWidget';
import { HiOutlineCog6Tooth, HiOutlineTrash } from 'react-icons/hi2';
import { BsInfoLg } from 'react-icons/bs';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import { atom } from 'jotai';
import { useDocTypeTranslation, useWidgetType } from '@/utils/api/hooks';
import { IconLinkButton } from '@/components/button/icon-link-button';
import { Inset } from './Inset';
import { ErrorScreen } from '@/components/errors';

export function DashboardEditMode({
	document,
	widgets,
	onToggleEditing,
}: {
	document: TypedDocumentDetails<Dashboard>;
	widgets: FormFieldReturnType<Record<string, Widget>>;
	onToggleEditing: () => void;
}) {
	const queryClient = useQueryClient();
	const launchModal = useLaunchModal();
	const { height, width } = useWidgetSizes(widgets.atom);
	const { widget } = useFormFields(widgets, {
		widget: (id: string) => [id],
	});
	const dropTarget = useDropTarget({
		[documentIdMimeType]: {
			canHandle({ link }) {
				if (!link) return false;
				return 'link';
			},
			handle(ev, data) {
				if (data.gameId !== document.gameId) return false;
				const currentTarget = ev.currentTarget as HTMLDivElement;
				const rect = currentTarget.getBoundingClientRect();
				const x = toGridCoordinate(ev.clientX - Math.round(rect.left));
				const y = toGridCoordinate(ev.clientY - Math.round(rect.top));
				void addWidget(queryClient, launchModal, data, widgets, { x, y });
				return true;
			},
		},
	});

	return (
		<DashboardContainer.Editing
			{...dropTarget}
			style={{ ['--h']: height, ['--w']: width }}
		>
			{Object.entries(document.details.widgets).map(
				([key, config]: [string, Widget]) => (
					<EditingWidget
						key={key}
						widgetId={key}
						widget={widget(key)}
						dashboard={document}
						config={config}
						onDelete={onDelete(key)}
						onInfo={onInfo(key)}
					/>
				),
			)}
			<div className="fixed right-4 bottom-4">
				<IconButton onClick={onToggleEditing}>
					<HiCheck />
				</IconButton>
			</div>
		</DashboardContainer.Editing>
	);
	function onDelete(id: string) {
		return () => void deleteWidget(launchModal, document.gameId, widgets, id);
	}
	function onInfo(id: string) {
		return () =>
			void showWidgetInfo(
				launchModal,
				document.gameId,
				document.details.widgets[id],
			);
	}
}

const hoverVisibility = atom((get) => (get(isDraggingAtom) ? 'none' : null));
export function EditingWidget({
	widget,
	widgetId,
	dashboard: { gameId },
	config,
	onDelete,
	onInfo,
}: {
	widget: FormFieldReturnType<Widget>;
	widgetId: string;
	dashboard: DocumentDetails;
	config: Widget;
	onDelete: () => void;
	onInfo: () => void;
}) {
	const t = useDocTypeTranslation('Dashboard');
	const stopDragging = useDropTarget({
		[documentIdMimeType]: {
			canHandle: (effect) => (effect.link ? 'none' : false),
			handle: () => true,
		},
	});
	const widgetDefinition = useWidgetType(
		gameId,
		config.documentId,
		config.widget,
	);
	return (
		<ErrorBoundary errorKey={JSON.stringify(config)} fallback={<></>}>
			<MoveResizeWidget
				field={widget.field(['position'])}
				constraints={widgetDefinition.getConstraints(config.settings)}
			>
				<Inset
					className="bg-slate-50 dark:bg-slate-950 -m-0.5 border-2 border-black/50"
					{...stopDragging}
				/>
				<Inset
					style={{
						pointerEvents: hoverVisibility,
					}}
				>
					<ErrorBoundary
						errorKey={JSON.stringify(config)}
						fallback={
							<ErrorScreen message={t('widgets.widget-runtime-error')} />
						}
					>
						<RenderWidget gameId={gameId} widgetConfig={config} />
					</ErrorBoundary>
				</Inset>
				<Inset
					className="bg-slate-900/75 dark:bg-slate-50/75 flex flex-row flex-wrap justify-center items-center gap-2 opacity-0 hover:opacity-100 focus:opacity-100 focus-within:opacity-100 transition-opacity duration-300"
					style={{ display: hoverVisibility }}
				>
					<IconButton.Destructive onClick={onDelete}>
						<HiOutlineTrash />
					</IconButton.Destructive>
					{widgetDefinition.settings ? (
						<IconLinkButton to={`widget/${widgetId}`}>
							<HiOutlineCog6Tooth />
						</IconLinkButton>
					) : null}
					<IconButton onClick={onInfo}>
						<BsInfoLg />
					</IconButton>
				</Inset>
			</MoveResizeWidget>
		</ErrorBoundary>
	);
}
