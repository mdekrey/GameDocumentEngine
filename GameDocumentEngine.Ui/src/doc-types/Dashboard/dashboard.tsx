import '@/utils/api/queries';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { Dashboard } from './types';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import styles from './dashboard.module.css';
import { documentIdMimeType, useDropTarget } from '@/components/drag-drop';

const gridOffset = 16;
const gridSize = 32;

const toGridCoordinate = (client: number) =>
	Math.max(0, Math.floor((client - gridOffset) / gridSize));

export function Dashboard({
	form,
	onSubmit,
}: GameObjectFormComponent<Dashboard>) {
	useSubmitOnChange(form, onSubmit);
	const dropTarget = useDropTarget({
		[documentIdMimeType]: {
			canHandle({ link }) {
				if (!link) return false;
				return 'link';
			},
			handle(ev, data) {
				const currentTarget = ev.currentTarget as HTMLDivElement;
				const rect = currentTarget.getBoundingClientRect();
				const x = toGridCoordinate(ev.clientX - Math.round(rect.left));
				const y = toGridCoordinate(ev.clientY - Math.round(rect.top));
				console.log(data, x, y);
				return true;
			},
		},
	});

	return (
		<div
			className={styles.dashboardGrid}
			style={{ '--grid-size': gridSize, '--grid-offset': gridOffset }}
			{...dropTarget}
		></div>
	);
}
