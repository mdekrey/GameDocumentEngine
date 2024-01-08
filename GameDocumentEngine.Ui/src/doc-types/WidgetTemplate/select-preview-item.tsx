import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { WidgetTemplate } from './types';
import { useAtomValue } from 'jotai';
import { useAllDocuments } from '@/utils/api/hooks';
import { Link } from 'react-router-dom';

export function SelectPreviewItem({
	document,
	form,
}: GameObjectFormComponent<WidgetTemplate>) {
	const allDocs = useAllDocuments(document.gameId);
	const docType = useAtomValue(form.field(['details', 'docType']).atom);
	const previewableDocs = Array.from(allDocs.data.values()).filter(
		(d) => d.type == docType,
	);
	return (
		<ul>
			{previewableDocs.map((d) => (
				<li key={d.id}>
					<Link to={`preview/${d.id}`}>{d.name}</Link>
				</li>
			))}
		</ul>
	);
}
