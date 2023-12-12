import '@/utils/api/queries';
import { useReducer } from 'react';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import {
	missingDocumentType,
	missingDocumentTypeName,
	missingWidgetTypeName,
	defaultMissingWidgetDefinition,
} from '@/documents/defaultMissingWidgetDefinition';
import type { Dashboard, Widget } from './types';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import {
	documentIdMimeType,
	isDraggingAtom,
	useDropTarget,
} from '@/components/drag-drop';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { useLaunchModal } from '@/utils/modal/modal-service';
import { addWidget } from './add-widget/addWidget';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
	DashboardContainer,
	WidgetContainer,
	toGridCoordinate,
} from './grid-utils';
import { RenderWidget } from './RenderWidget';
import { MoveResizeWidget } from './MoveResizeWidget';
import { IconButton } from '@/components/button/icon-button';
import { HiCheck, HiOutlineTrash, HiPencil } from 'react-icons/hi2';
import { BsInfoLg } from 'react-icons/bs';
import { deleteWidget } from './delete-widget/deleteWidget';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import type { UserDetails } from '@/api/models/UserDetails';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import { showWidgetInfo } from './info/info';
import { JotaiDiv } from '@/components/jotai/div';
import { atom } from 'jotai';
import { elementTemplate } from '@/components/template';
import type { GameTypeScripts } from '@/utils/api/queries/game-types';
import { queries } from '@/utils/api/queries';

export function DashboardDisplay({
	document,
	form,
	user,
	gameType,
	writablePointers,
	onSubmit,
}: GameObjectFormComponent<Dashboard>) {
	const canUpdateWidgets = writablePointers.contains('details', 'widgets');
	const queryClient = useQueryClient();
	useSubmitOnChange(form, onSubmit);
	const launchModal = useLaunchModal();
	const { widgets, widget } = useFormFields(form, {
		widgets: ['details', 'widgets'],
		widget: (id: string) => ['details', 'widgets', id],
	});
	const dashboardHeight = useComputedAtom((get) => {
		return Math.max(
			...Object.values(get(widgets.atom)).map(
				(w) => w.position.y + w.position.height,
			),
		).toFixed(0);
	});
	const dashboardWidth = useComputedAtom((get) => {
		return Math.max(
			...Object.values(get(widgets.atom)).map(
				(w) => w.position.x + w.position.width,
			),
		).toFixed(0);
	});
	const [editing, toggleEditing] = useReducer(
		canUpdateWidgets ? (prev) => !prev : () => false,
		false,
	);
	const dropTarget = useDropTarget({
		[documentIdMimeType]: {
			canHandle({ link }) {
				if (!canUpdateWidgets) return false;
				if (!link) return false;
				if (!editing) toggleEditing();
				return 'link';
			},
			handle(ev, data) {
				if (data.gameId !== document.gameId) return false;
				if (!editing) toggleEditing();
				const currentTarget = ev.currentTarget as HTMLDivElement;
				const rect = currentTarget.getBoundingClientRect();
				const x = toGridCoordinate(ev.clientX - Math.round(rect.left));
				const y = toGridCoordinate(ev.clientY - Math.round(rect.top));
				void addWidget(queryClient, launchModal, data, widgets, { x, y });
				return true;
			},
		},
	});

	if (!editing) {
		return (
			<DashboardContainer
				{...dropTarget}
				style={{ ['--h']: dashboardHeight, ['--w']: dashboardWidth }}
			>
				{Object.entries(document.details.widgets).map(
					([key, config]: [string, Widget]) => (
						<WidgetContainer key={key} position={config.position}>
							<RenderWidget
								key={key}
								gameType={gameType}
								gameId={document.gameId}
								user={user}
								{...config}
							/>
						</WidgetContainer>
					),
				)}
				<div className="fixed right-4 bottom-4">
					{canUpdateWidgets && (
						<IconButton onClick={toggleEditing}>
							<HiPencil />
						</IconButton>
					)}
				</div>
			</DashboardContainer>
		);
	}

	return (
		<DashboardContainer.Editing
			{...dropTarget}
			style={{ ['--h']: dashboardHeight, ['--w']: dashboardWidth }}
		>
			{Object.entries(document.details.widgets).map(
				([key, config]: [string, Widget]) => (
					<EditingWidget
						key={key}
						gameType={gameType}
						widget={widget(key)}
						dashboard={document}
						user={user}
						config={config}
						onDelete={onDelete(key)}
						onInfo={onInfo(key)}
					/>
				),
			)}
			<div className="fixed right-4 bottom-4">
				<IconButton onClick={toggleEditing}>
					<HiCheck />
				</IconButton>
			</div>
		</DashboardContainer.Editing>
	);
	function onDelete(id: string) {
		return () =>
			void deleteWidget(queryClient, launchModal, document.gameId, widgets, id);
	}
	function onInfo(id: string) {
		return () =>
			void showWidgetInfo(
				queryClient,
				launchModal,
				document.gameId,
				document.details.widgets[id],
			);
	}
}

const Inset = elementTemplate('Inset', JotaiDiv, (T) => (
	<T className="absolute inset-0" />
));
const hoverVisibility = atom((get) => (get(isDraggingAtom) ? 'none' : null));
function EditingWidget({
	gameType,
	widget,
	dashboard: { gameId },
	user,
	config,
	onDelete,
	onInfo,
}: {
	gameType: GameTypeScripts;
	widget: FormFieldReturnType<Widget>;
	dashboard: DocumentDetails;
	user: UserDetails;
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
	const document = useQuery(queries.getDocument(gameId, config.documentId));

	const gameObjectType =
		gameType.objectTypes[document.data?.type ?? missingDocumentTypeName]
			?.typeInfo ?? missingDocumentType;
	const widgetDefinition =
		gameObjectType.widgets?.[config.widget ?? missingWidgetTypeName] ??
		defaultMissingWidgetDefinition;
	return (
		<ErrorBoundary fallback={<></>}>
			<MoveResizeWidget
				field={widget.field(['position'])}
				widgetDefinition={widgetDefinition}
				widgetConfig={config}
				gameObjectType={gameObjectType}
			>
				<Inset
					className="bg-slate-50 dark:bg-slate-950 -m-0.5 border-2 border-black/50"
					{...stopDragging}
				/>
				<Inset
					style={{
						// TODO: only disable pointerEvents if the widget doesn't allow contents
						pointerEvents: hoverVisibility,
					}}
				>
					<RenderWidget
						gameType={gameType}
						gameId={gameId}
						user={user}
						{...config}
					/>
				</Inset>
				<Inset
					className="bg-slate-900/75 dark:bg-slate-50/75 flex flex-row flex-wrap justify-center items-center gap-2 opacity-0 hover:opacity-100 focus:opacity-100 focus-within:opacity-100 transition-opacity duration-300"
					style={{ display: hoverVisibility }}
				>
					<IconButton.Destructive onClick={onDelete}>
						<HiOutlineTrash />
					</IconButton.Destructive>
					<IconButton onClick={onInfo}>
						<BsInfoLg />
					</IconButton>
				</Inset>
			</MoveResizeWidget>
		</ErrorBoundary>
	);
}
