import '@/utils/api/queries';
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
	applyGridScale,
	fromGridCoordinate,
	gridSize,
	toGridCoordinate,
} from './grid-utils';
import { RenderWidget } from './RenderWidget';
import { useAtomValue } from 'jotai';
import { Rnd } from 'react-rnd';

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
				console.log(data, x, y);
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
			<MoveResizeWidget key={key} field={widget(key)}>
				<RenderWidget
					key={key}
					gameId={document.gameId}
					user={user}
					{...config}
				/>
			</MoveResizeWidget>
		);

	return (
		<Container {...dropTarget}>
			{Object.entries(document.details.widgets).map(contents)}
		</Container>
	);
}

function MoveResizeWidget({
	field,
	children,
}: {
	field: FormFieldReturnType<Widget>;
	children?: React.ReactNode;
}) {
	const { positionField } = useFormFields(field, {
		positionField: ['position'] as const,
	});
	const p = useAtomValue(positionField.value);
	return (
		<Rnd
			default={applyGridScale(p)}
			bounds="parent"
			dragGrid={[gridSize, gridSize]}
			resizeGrid={[gridSize, gridSize]}
			onDragStop={(e, d) =>
				positionField.onChange((prev) => ({
					...prev,
					x: toGridCoordinate(d.x),
					y: toGridCoordinate(d.y),
				}))
			}
			onResizeStop={(e, direction, ref, delta, position) => {
				console.log(e, direction, ref, delta, position);
				positionField.onChange((prev) => {
					const result = {
						height: toGridCoordinate(
							fromGridCoordinate(prev.height) + delta.height,
						),
						width: toGridCoordinate(
							fromGridCoordinate(prev.width) + delta.width,
						),
						x: toGridCoordinate(position.x),
						y: toGridCoordinate(position.y),
					};
					console.log(result);
					return result;
				});
			}}
		>
			{children}
			<div className="bg-slate-500/25 absolute inset-0 border-4 border-black/50 dark:bg-slate-50/50"></div>
		</Rnd>
	);
}
