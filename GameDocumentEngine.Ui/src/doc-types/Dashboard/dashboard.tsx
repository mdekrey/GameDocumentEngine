import '@/utils/api/queries';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { Dashboard } from './types';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import styles from './dashboard.module.css';

export function Dashboard({
	form,
	onSubmit,
	readablePointers,
}: GameObjectFormComponent<Dashboard>) {
	useSubmitOnChange(form, onSubmit);
	console.log(readablePointers);

	return <div className={styles.dashboardGrid}></div>;
}
