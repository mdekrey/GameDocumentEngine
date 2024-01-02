import type { GameImportArchiveSummary } from '@/api/models/GameImportArchiveSummary';
import type { ImportIntoExistingGameOptions } from '@/api/models/ImportIntoExistingGameOptions';
import { Button } from '@/components/button/button';
import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useForm } from '@principlestudios/react-jotai-forms';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useDocumentListMapping, usePlayerListMapping } from './mappings';

const schema = z.object({
	game: z.boolean(),
	documents: z.string().array(),
	players: z
		.object({
			id: z.string(),
		})
		.array(),
}) satisfies z.ZodType<ImportIntoExistingGameOptions>;

export function ConfigureImportIntoExistingGame({
	additional,
	resolve,
}: ModalContentsProps<
	ImportIntoExistingGameOptions,
	{ inspected: GameImportArchiveSummary; gameId: string }
>) {
	const { t } = useTranslation(['configre-import-existing-game']);
	const mapToDocumentsList = useDocumentListMapping(
		additional.inspected.documents,
	);
	const mapToPlayersList = usePlayerListMapping(additional.inspected.players);
	const form = useForm({
		defaultValue: {
			game: true,
			documents: additional.inspected.documents.map((d) => d.id),
			players: additional.inspected.players.map((p) => ({ id: p.id })),
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
