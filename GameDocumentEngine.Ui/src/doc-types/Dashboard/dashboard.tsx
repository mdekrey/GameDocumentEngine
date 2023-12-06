import '@/utils/api/queries';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { Dashboard } from './types';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import styles from './dashboard.module.css';
import { documentIdMimeType, useDropTarget } from '@/components/drag-drop';

export function Dashboard({
	form,
	onSubmit,
	readablePointers,
}: GameObjectFormComponent<Dashboard>) {
	useSubmitOnChange(form, onSubmit);
	console.log(readablePointers);
	const dropTarget = useDropTarget({
		[documentIdMimeType]: {
			canHandle({ link }) {
				if (!link) return false;
				return 'link';
			},
			handle(ev, data) {
				const currentTarget = ev.currentTarget as HTMLDivElement;
				console.log(
					data,
					currentTarget,
					ev.clientX - currentTarget.clientTop,
					ev.clientY - currentTarget.clientLeft,
				);
				return true;
			},
		},
	});

	return <div className={styles.dashboardGrid} {...dropTarget}></div>;
}
