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
import { DashboardContainer, toGridCoordinate } from './grid-utils';
import { RenderWidget } from './RenderWidget';
import { RenderWidgetContents } from './RenderWidgetContents';
import type { RenderWidgetContentsProps } from './RenderWidgetContentsProps';

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

	return (
		<Container {...dropTarget}>
			{Object.entries(document.details.widgets).map(([key, config]) => (
				<RenderWidget
					key={key}
					gameId={document.gameId}
					user={user}
					widgetContents={MoveResizeWidget}
					additional={{ field: widget(key) }}
					{...config}
				/>
			))}
		</Container>
	);
}

function MoveResizeWidget({
	component,
	document,
	user,
	additional: { field },
}: RenderWidgetContentsProps<{ field: FormFieldReturnType<Widget> }>) {
	console.log(field);
	return (
		<>
			<div className="bg-slate-50 dark:bg-slate-950 absolute inset-0">
				<RenderWidgetContents
					additional={undefined}
					component={component}
					document={document}
					user={user}
				/>
			</div>
			<div className="bg-slate-500/25 absolute inset-0 border-4 border-black/50 dark:bg-slate-50/50"></div>
		</>
	);
}
