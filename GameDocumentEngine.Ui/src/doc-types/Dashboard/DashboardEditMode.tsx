import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { Dashboard, Widget } from './types';
import {
	documentIdMimeType,
	isDraggingAtom,
	useDropTarget,
} from '@/components/drag-drop';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { useAddWidget } from './add-widget/addWidget';
import {
	DashboardContainer,
	DashboardToolsContainer,
	toGridCoordinate,
} from './grid-utils';
import { IconButton } from '@/components/button/icon-button';
import { HiCheck } from 'react-icons/hi2';
import { useDeleteWidget } from './delete-widget/deleteWidget';
import { useShowWidgetInfo } from './info/info';
import { useWidgetSizes } from './useWidgetSizes';
import { RenderWidget } from './RenderWidget';
import { MoveResizeWidget } from './MoveResizeWidget';
import { HiOutlineCog6Tooth, HiOutlineTrash } from 'react-icons/hi2';
import { BsInfoLg } from 'react-icons/bs';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import { atom } from 'jotai';
import { useDocument, useWidgetType } from '@/utils/api/hooks';
import { IconLinkButton } from '@/components/button/icon-link-button';
import { Inset } from './Inset';
import { useWidget } from './useWidget';
import { useNavigate } from 'react-router-dom';

export function DashboardEditMode({
	document,
	form,
}: GameObjectFormComponent<Dashboard>) {
	const { widgets, widget } = useFormFields(form, {
		widgets: ['details', 'widgets'],
		widget: (id: string) => ['details', 'widgets', id],
	});
	const navigate = useNavigate();
	const onToggleEditing = () => navigate('..');
	const { height, width } = useWidgetSizes(widgets.atom);
	const addWidget = useAddWidget(widgets);
	const dropTarget = useDropTarget<HTMLElement>({
		[documentIdMimeType]: {
			canHandle({ link }) {
				if (!link) return false;
				return 'link';
			},
			handle(ev, data) {
				if (data.gameId !== document.gameId) return false;
				const rect = ev.currentTarget.getBoundingClientRect();
				const x = toGridCoordinate(ev.clientX - Math.round(rect.left));
				const y = toGridCoordinate(ev.clientY - Math.round(rect.top));
				void addWidget(data, { x, y });
				return true;
			},
		},
	});
	const onDelete = useDeleteWidget(document.gameId, widgets);
	const showWidgetInfo = useShowWidgetInfo(document.gameId);
	const onInfo = (id: string) => () =>
		void showWidgetInfo(document.details.widgets[id]);

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
			<DashboardToolsContainer>
				<IconButton onClick={onToggleEditing}>
					<HiCheck />
				</IconButton>
			</DashboardToolsContainer>
		</DashboardContainer.Editing>
	);
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
	const document = useDocument(gameId, widget.get().documentId);
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
	const Widget = useWidget(gameId, config);

	return (
		<ErrorBoundary errorKey={JSON.stringify(config)} fallback={<></>}>
			<MoveResizeWidget
				field={widget.field(['position'])}
				constraints={widgetDefinition.getConstraints(document, config.settings)}
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
