import type { GameImportArchiveSummary } from '@/api/models/GameImportArchiveSummary';
import type { ImportGameOptions } from '@/api/models/ImportGameOptions';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useForm } from '@principlestudios/react-jotai-forms';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
	documentOptionsSchema,
	playerOptionsSchema,
	useDocumentListMapping,
	usePlayerListMapping,
} from './mappings';
import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import { Button } from '@/components/button/button';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { Section, SectionHeader } from '@/components/sections';
import { SelectDocuments } from './SelectDocuments';
import { SelectPlayers } from './SelectPlayers';

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
	const { t } = useTranslation(['configure-import-new-game']);
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
				schema: documentOptionsSchema.array(),
			},
			players: {
				path: ['players'],
				mapping: mapToPlayersList,
				schema: playerOptionsSchema.array(),
			},
		},
	});
	return (
		<form onSubmit={form.handleSubmit(resolve)}>
			<ModalDialogLayout>
				<ModalDialogLayout.Title>{t('title')}</ModalDialogLayout.Title>
				<Fieldset>
					<Section>
						<SectionHeader>
							{form.fields.documents.translation('label')}
						</SectionHeader>
						<SelectDocuments
							field={form.fields.documents}
							documents={inspected.documents}
						/>
					</Section>
					<Section>
						<SectionHeader>
							{form.fields.players.translation('label')}
						</SectionHeader>
						<SelectPlayers
							field={form.fields.players}
							players={inspected.players}
						/>
					</Section>
				</Fieldset>
				<ModalDialogLayout.Buttons>
					<Button type="submit">{t('submit')}</Button>
				</ModalDialogLayout.Buttons>
			</ModalDialogLayout>
		</form>
	);
}
