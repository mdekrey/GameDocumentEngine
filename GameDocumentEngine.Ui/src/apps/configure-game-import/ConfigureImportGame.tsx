import type { GameImportArchiveSummary } from '@/api/models/GameImportArchiveSummary';
import type { ImportGameOptions } from '@/api/models/ImportGameOptions';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useForm } from '@principlestudios/react-jotai-forms';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const schema = z.object({
	documents: z.string().array(),
	players: z
		.object({
			id: z.string(),
		})
		.array(),
}) satisfies z.ZodType<ImportGameOptions>;

export function ConfigureImportGame({
	additional,
	resolve,
}: ModalContentsProps<
	ImportGameOptions,
	{ inspected: GameImportArchiveSummary }
>) {
	const { t } = useTranslation(['configre-import-new-game']);
	const form = useForm({
		defaultValue: {
			documents: additional.inspected.documents.map((d) => d.id),
			players: additional.inspected.players.map((p) => ({ id: p.id })),
		},
		schema,
		translation: t,
	});
	resolve(form.get());
	return <></>;
}
