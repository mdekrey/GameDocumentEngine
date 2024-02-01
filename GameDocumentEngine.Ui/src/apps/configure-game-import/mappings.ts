import type { GameImportArchiveSummary } from '@vaultvtt/api/openapi/models/GameImportArchiveSummary';
import type { ImportPlayerOptions } from '@vaultvtt/api/openapi/models/ImportPlayerOptions';
import type { FieldMapping } from '@principlestudios/react-jotai-forms';
import { z } from 'zod';

export type ImportDocumentFormOptions = {
	id: string;
	selected: boolean;
};
export type ImportPlayerFormOptions = ImportPlayerOptions & {
	selected: boolean;
};

export function usePlayerListMapping(
	players: GameImportArchiveSummary['players'],
): FieldMapping<ImportPlayerOptions[], ImportPlayerFormOptions[]> {
	return {
		toForm(v) {
			return players.map((p) => {
				const target = v.find((e) => e.id === p.id);
				return {
					id: p.id,
					selected: !!target,
					...(target ?? {}),
				};
			});
		},
		fromForm(v) {
			return (
				v
					.filter((e) => e.selected)
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					.map(({ selected, ...rest }): ImportPlayerOptions => rest)
			);
		},
	};
}
export const playerOptionsSchema = z.object({
	id: z.string(),
	selected: z.boolean(),
}) satisfies z.ZodType<ImportPlayerFormOptions>;

export function useDocumentListMapping(
	documents: GameImportArchiveSummary['documents'],
): FieldMapping<string[], ImportDocumentFormOptions[]> {
	return {
		toForm(v) {
			return documents.map((d) => ({
				id: d.id,
				selected: v.includes(d.id),
			}));
		},
		fromForm(v) {
			return v.filter((e) => e.selected).map((e) => e.id);
		},
	};
}
export const documentOptionsSchema = z.object({
	id: z.string(),
	selected: z.boolean(),
}) satisfies z.ZodType<ImportDocumentFormOptions>;
