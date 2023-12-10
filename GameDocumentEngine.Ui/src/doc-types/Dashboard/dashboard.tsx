import '@/utils/api/queries';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { Dashboard, Widget } from './types';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import { documentIdMimeType, useDropTarget } from '@/components/drag-drop';
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
import { HiOutlineTrash } from 'react-icons/hi2';
import { deleteWidget } from './delete-widget/deleteWidget';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';

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

	const editing = true;
	const Container = !editing ? DashboardContainer : DashboardContainer.Editing;
	const contents = ([key, config]: [string, Widget]) =>
		!editing ? (
			<WidgetContainer key={key} position={config.position}>
				<RenderWidget
					key={key}
					gameId={document.gameId}
					user={user}
					{...config}
				/>
			</WidgetContainer>
		) : (
			<ErrorBoundary key={key} fallback={<></>}>
				<MoveResizeWidget field={widget(key)}>
					<RenderWidget
						key={key}
						gameId={document.gameId}
						user={user}
						{...config}
					/>
					<MoveResizeWidget.Buttons>
						<IconButton.Destructive
							onClick={() =>
								void deleteWidget(
									queryClient,
									launchModal,
									document.gameId,
									widgets,
									key,
								)
							}
						>
							<HiOutlineTrash />
						</IconButton.Destructive>
					</MoveResizeWidget.Buttons>
				</MoveResizeWidget>
			</ErrorBoundary>
		);

	return (
		<Container {...dropTarget}>
			{Object.entries(document.details.widgets).map(contents)}
		</Container>
	);
}
