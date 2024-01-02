import type { GameImportArchiveSummary } from '@/api/models/GameImportArchiveSummary';
import type { ImportGameOptions } from '@/api/models/ImportGameOptions';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useForm } from '@principlestudios/react-jotai-forms';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useDocumentListMapping, usePlayerListMapping } from './mappings';
import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import { Button } from '@/components/button/button';

const schema = z.object({
	documents: z.string().array(),
	players: z
		.object({
			id: z.string(),
		})
		.array(),
}) satisfies z.ZodType<ImportGameOptions>;

export function ConfigureImportGame({
	additional: { inspected },
	resolve,
}: ModalContentsProps<
	ImportGameOptions,
	{ inspected: GameImportArchiveSummary }
>) {
	const { t } = useTranslation(['configre-import-new-game']);
	const mapToDocumentsList = useDocumentListMapping(inspected.documents);
	const mapToPlayersList = usePlayerListMapping(inspected.players);
	const form = useForm({
		defaultValue: {
			documents: inspected.documents.map((d) => d.id),
			players: inspected.players.map((p) => ({ id: p.id })),
		},
		schema,
		translation: t,
		fields: {
			documents: {
				path: ['documents'],
				mapping: mapToDocumentsList,
			},
			players: {
				path: ['players'],
				mapping: mapToPlayersList,
			},
		},
	});
	return (
		<form onSubmit={form.handleSubmit(resolve)}>
			<ModalDialogLayout>
				<ModalDialogLayout.Title>{t('title')}</ModalDialogLayout.Title>

				<ModalDialogLayout.Buttons>
					<Button type="submit">{t('ok')}</Button>
				</ModalDialogLayout.Buttons>
			</ModalDialogLayout>
		</form>
	);
}
