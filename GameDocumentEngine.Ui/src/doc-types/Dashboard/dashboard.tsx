import '@/utils/api/queries';
import { useReducer } from 'react';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { Dashboard, Widget } from './types';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import { documentIdMimeType, useDropTarget } from '@/components/drag-drop';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { useLaunchModal } from '@/utils/modal/modal-service';
import { addWidget } from './add-widget/addWidget';
import { useQueryClient } from '@tanstack/react-query';
import {
	DashboardContainer,
	WidgetContainer,
	toGridCoordinate,
} from './grid-utils';
import { RenderWidget } from './RenderWidget';
import { MoveResizeWidget } from './MoveResizeWidget';
import { IconButton } from '@/components/button/icon-button';
import { HiCheck, HiOutlineTrash, HiPencil } from 'react-icons/hi2';
import { deleteWidget } from './delete-widget/deleteWidget';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import type { UserDetails } from '@/api/models/UserDetails';
import type { DocumentDetails } from '@/api/models/DocumentDetails';

export function DashboardDisplay({
	document,
	form,
	user,
	onSubmit,
}: GameObjectFormComponent<Dashboard>) {
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
	const [editing, toggleEditing] = useReducer((prev) => !prev, false);
	const dropTarget = useDropTarget({
		[documentIdMimeType]: {
			canHandle({ link }) {
				if (!link) return false;
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
								gameId={document.gameId}
								user={user}
								{...config}
							/>
						</WidgetContainer>
					),
				)}
				<div className="fixed right-4 bottom-4">
					<IconButton onClick={toggleEditing}>
						<HiPencil />
					</IconButton>
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
						widget={widget(key)}
						document={document}
						user={user}
						config={config}
						onDelete={onDelete(key)}
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
}
function EditingWidget({
	widget,
	document,
	user,
	config,
	onDelete,
}: {
	widget: FormFieldReturnType<Widget>;
	document: DocumentDetails;
	user: UserDetails;
	config: Widget;
	onDelete: () => void;
}) {
	return (
		<ErrorBoundary fallback={<></>}>
			<MoveResizeWidget field={widget}>
				<RenderWidget gameId={document.gameId} user={user} {...config} />
				<MoveResizeWidget.Buttons>
					<IconButton.Destructive onClick={onDelete}>
						<HiOutlineTrash />
					</IconButton.Destructive>
				</MoveResizeWidget.Buttons>
			</MoveResizeWidget>
		</ErrorBoundary>
	);
}
