import '@/utils/api/queries';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { Dashboard } from './types';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import styles from './dashboard.module.css';
import { documentIdMimeType, useDropTarget } from '@/components/drag-drop';
import { elementTemplate } from '@/components/template';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import { useLaunchModal } from '@/utils/modal/modal-service';
import { addWidget } from './add-widget/addWidget';

const gridOffset = 16;
const gridSize = 16;

const toGridCoordinate = (client: number) =>
	Math.max(0, Math.floor((client - gridOffset) / gridSize));

const DashboardContainer = elementTemplate('DashboardContainer', 'div', (T) => (
	<T
		className={styles.dashboardGrid}
		style={{ '--grid-size': gridSize, '--grid-offset': gridOffset }}
	/>
)).themed({
	Editing: (T) => <T className={styles.editing} />,
});

export function DashboardDisplay({
	gameId,
	form,
	onSubmit,
}: GameObjectFormComponent<Dashboard>) {
	useSubmitOnChange(form, onSubmit);
	const launchModal = useLaunchModal();
	const { widgets } = useFormFields(form, { widgets: ['details', 'widgets'] });
	const dropTarget = useDropTarget({
		[documentIdMimeType]: {
			canHandle({ link }) {
				if (!link) return false;
				return 'link';
			},
			handle(ev, data) {
				if (data.gameId !== gameId) return false;
				const currentTarget = ev.currentTarget as HTMLDivElement;
				const rect = currentTarget.getBoundingClientRect();
				const x = toGridCoordinate(ev.clientX - Math.round(rect.left));
				const y = toGridCoordinate(ev.clientY - Math.round(rect.top));
				void addWidget(launchModal, data, widgets, { x, y });
				console.log(data, x, y);
				return true;
			},
		},
	});

	const editing = true;
	const Container = !editing ? DashboardContainer : DashboardContainer.Editing;

	return <Container {...dropTarget}></Container>;
}
