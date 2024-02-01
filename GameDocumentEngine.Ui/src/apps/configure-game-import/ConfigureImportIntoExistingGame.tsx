import type { GameImportArchiveSummary } from '@vaultvtt/api/openapi/models/GameImportArchiveSummary';
import type { ImportIntoExistingGameOptions } from '@vaultvtt/api/openapi/models/ImportIntoExistingGameOptions';
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
import { Section, SectionHeader } from '@/components/sections';
import { SelectDocuments } from './SelectDocuments';
import { SelectPlayers } from './SelectPlayers';
import { CheckboxField } from '@/components/form-fields/checkbox-input/checkbox-field';
import { ModalForm } from '@/utils/modal/modal-form';

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
	additional: { inspected },
	resolve,
}: ModalContentsProps<
	ImportIntoExistingGameOptions,
	{ inspected: GameImportArchiveSummary; gameId: string }
>) {
	const { t } = useTranslation(['configure-import-existing-game']);
	const mapToDocumentsList = useDocumentListMapping(inspected.documents);
	const mapToPlayersList = usePlayerListMapping(inspected.players);
	const form = useForm({
		defaultValue: {
			game: true,
			documents: inspected.documents.map((d) => d.id),
			players: inspected.players.map((p) => ({ id: p.id })),
		},
		schema,
		translation: t,
		fields: {
			includeGameDetails: {
				path: ['game'],
			},
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
		<ModalForm onSubmit={form.handleSubmit(resolve)} translation={t}>
			<CheckboxField field={form.fields.includeGameDetails} />

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
		</ModalForm>
	);
}
