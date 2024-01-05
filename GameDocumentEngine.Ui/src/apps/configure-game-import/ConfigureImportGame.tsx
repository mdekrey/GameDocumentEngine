import type { GameImportArchiveSummary } from '@/api/models/GameImportArchiveSummary';
import type { ImportGameOptions } from '@/api/models/ImportGameOptions';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useForm, useFormFields } from '@principlestudios/react-jotai-forms';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type {
	ImportDocumentFormOptions,
	ImportPlayerFormOptions,
} from './mappings';
import {
	documentOptionsSchema,
	playerOptionsSchema,
	useDocumentListMapping,
	usePlayerListMapping,
} from './mappings';
import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import { Button } from '@/components/button/button';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { useFieldList } from '@/doc-types/Break-Character/parts/useFieldList';
import { CheckboxField } from '@/components/form-fields/checkbox-input/checkbox-field';
import { Prose } from '@/components/text/common';
import { Section, SectionHeader } from '@/components/sections';

const schema = z.object({
	documents: z.string().array(),
	players: z
		.object({
			id: z.string(),
		})
		.array(),
}) satisfies z.ZodType<ImportGameOptions>;

const docArray = documentOptionsSchema.array();

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
				schema: docArray,
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

function SelectDocuments({
	field,
	documents,
}: {
	field: FormFieldReturnType<ImportDocumentFormOptions[]>;
	documents: GameImportArchiveSummary['documents'];
}) {
	const defaultOption: ImportDocumentFormOptions = {
		id: '',
		selected: false,
	};
	const { length, item, key } = useFieldList(field, defaultOption, (v) => v.id);
	return (
		<>
			{Array(length)
				.fill(0)
				.map((_, index) => (
					<ConfigureDocumentOptions
						key={key(index)}
						field={item(index)}
						document={documents[index]}
					/>
				))}
		</>
	);
}

function ConfigureDocumentOptions({
	field,
	document,
}: {
	field: FormFieldReturnType<ImportDocumentFormOptions>;
	document: GameImportArchiveSummary['documents'][number];
}) {
	const { selected } = useFormFields(field, {
		selected: ['selected'],
	});
	return (
		<div>
			<Prose>{document.name}</Prose>
			<CheckboxField field={selected} />
		</div>
	);
}

function SelectPlayers({
	field,
	players,
}: {
	field: FormFieldReturnType<ImportPlayerFormOptions[]>;
	players: GameImportArchiveSummary['players'];
}) {
	const defaultOption: ImportPlayerFormOptions = {
		id: '',
		selected: false,
	};
	const { length, item, key } = useFieldList(field, defaultOption, (v) => v.id);
	return (
		<>
			{Array(length)
				.fill(0)
				.map((_, index) => (
					<ConfigurePlayerOptions
						key={key(index)}
						field={item(index)}
						player={players[index]}
					/>
				))}
		</>
	);
}

function ConfigurePlayerOptions({
	field,
	player,
}: {
	field: FormFieldReturnType<ImportPlayerFormOptions>;
	player: GameImportArchiveSummary['players'][number];
}) {
	const { selected } = useFormFields(field, {
		selected: ['selected'],
	});
	return (
		<div>
			<Prose>{player.name}</Prose>
			<CheckboxField field={selected} />
		</div>
	);
}
