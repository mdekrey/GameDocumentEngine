import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { WidgetTemplate, Widget } from '../types';
import {
	documentIdMimeType,
	isDraggingAtom,
	useDropTarget,
} from '@/components/drag-drop';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { useLaunchModal } from '@/utils/modal/modal-service';
import { useQueryClient } from '@tanstack/react-query';
import {
	WidgetGridContainer,
	toGridCoordinate,
} from '@/doc-types/Dashboard/grid-utils';
import { IconButton } from '@/components/button/icon-button';
import { addWidget } from './add-widget/addWidget';
import { deleteWidget } from './delete-widget/deleteWidget';
import { showWidgetInfo } from './info/info';
import { useWidgetSizes } from '@/doc-types/Dashboard/useWidgetSizes';
import { RenderWidget } from '@/doc-types/Dashboard/RenderWidget';
import { MoveResizeWidget } from '@/doc-types/Dashboard/MoveResizeWidget';
import { HiOutlineCog6Tooth, HiOutlineTrash } from 'react-icons/hi2';
import { BsInfoLg } from 'react-icons/bs';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import { atom } from 'jotai';
import { useDocument, useWidgetType } from '@/utils/api/hooks';
import { IconLinkButton } from '@/components/button/icon-link-button';
import { Inset } from '@/doc-types/Dashboard/Inset';
import { useWidget } from '../useWidget';

export function WidgetTemplateEditMode({
	document,
	previewDocumentId,
	form,
}: GameObjectFormComponent<WidgetTemplate> & { previewDocumentId: string }) {
	const previewDocument = useDocument(document.gameId, previewDocumentId);
	const { widgets } = useFormFields(form, {
		widgets: ['details', 'widgets'],
	});

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
				void addWidget(queryClient, launchModal, previewDocument, widgets, {
					x,
					y,
				});
				return true;
			},
		},
	});

	return (
		<WidgetGridContainer.Editing
			{...dropTarget}
			style={{ ['--h']: height, ['--w']: width }}
		>
			{Object.entries(document.details.widgets).map(
				([key, config]: [string, Widget]) => (
					<EditingWidget
						key={key}
						widgetId={key}
						widget={widget(key)}
						previewDocument={previewDocument}
						dashboard={document}
						config={config}
						onDelete={onDelete(key)}
						onInfo={onInfo(key)}
					/>
				),
			)}
		</WidgetGridContainer.Editing>
	);
	function onDelete(id: string) {
		return () =>
			void deleteWidget(
				launchModal,
				document.gameId,
				previewDocument,
				widgets,
				id,
			);
	}
	function onInfo(id: string) {
		return () =>
			void showWidgetInfo(
				launchModal,
				document.gameId,
				previewDocument,
				document.details.widgets[id],
			);
	}
}

const hoverVisibility = atom((get) => (get(isDraggingAtom) ? 'none' : null));
export function EditingWidget({
	widget,
	widgetId,
	previewDocument,
	dashboard: { gameId },
	config,
	onDelete,
	onInfo,
}: {
	widget: FormFieldReturnType<Widget>;
	widgetId: string;
	previewDocument: DocumentDetails;
	dashboard: DocumentDetails;
	config: Widget;
	onDelete: () => void;
	onInfo: () => void;
}) {
	const stopDragging = useDropTarget({
		[documentIdMimeType]: {
			canHandle: (effect) => (effect.link ? 'none' : false),
			handle: () => true,
		},
	});
	const widgetDefinition = useWidgetType(
		gameId,
		previewDocument.id,
		config.widget,
	);
	const Widget = useWidget(previewDocument, config);
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
					<RenderWidget errorKey={JSON.stringify(config)} widget={<Widget />} />
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
