import type { GameImportArchiveSummary } from '@/api/models/GameImportArchiveSummary';
import type { ImportIntoExistingGameOptions } from '@/api/models/ImportIntoExistingGameOptions';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useForm } from '@principlestudios/react-jotai-forms';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

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
	const form = useForm({
		defaultValue: {
			game: true,
			documents: additional.inspected.documents.map((d) => d.id),
			players: additional.inspected.players.map((p) => ({ id: p.id })),
		},
		schema,
		translation: t,
	});
	resolve(form.get());
	return <></>;
}
