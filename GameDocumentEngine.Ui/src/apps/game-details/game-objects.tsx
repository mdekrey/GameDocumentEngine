import { IconLinkButton } from '@/components/button/icon-link-button';
import { queries } from '@/utils/api/queries';
import { useQuery } from '@tanstack/react-query';
import { HiPlus, HiChevronRight } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { useGameType } from '../documents/useGameType';
import { useTranslation } from 'react-i18next';
import { hasGamePermission } from '@/utils/security/match-permission';
import { createDocument } from '@/utils/security/permission-strings';
import type { DocumentSummary } from '@/api/models/DocumentSummary';
import type { FolderNode } from '@/utils/api/queries/document';
import type { GameTypeObjectScripts } from '@/utils/api/queries/game-types';
import { Prose } from '@/components/text/common';

export function GameObjects({ gameId }: { gameId: string }) {
	const { t } = useTranslation(['game-objects']);
	const docsResult = useQuery(queries.listDocuments(gameId));
	const gameDetails = useQuery(queries.getGameDetails(gameId));
	const gameType = useGameType(gameId);

	if (gameDetails.isLoading || docsResult.isLoading || gameType.isLoading) {
		return 'Loading';
	} else if (gameDetails.isError || docsResult.isError || gameType.isError) {
		return 'Error';
	}

	const canCreate = hasGamePermission(gameDetails.data, createDocument);

	docsResult.data.additional.unrootedFolderIds;

	return (
		<div className="h-full p-4 flex flex-col gap-2">
			<h2 className="text-xl font-bold hover:bg-white/25 dark:hover:bg-slate-950/25">
				<Link
					to={`/game/${gameId}`}
					className="flex flex-row justify-between items-center gap-2"
				>
					{gameDetails.data.name}

					<HiChevronRight className="h-5 w-5" />
				</Link>
			</h2>

			<section className="flex flex-col">
				<div className="flex flex-row gap-3">
					<h3 className="flex-1 text-lg font-bold">{t('header')}</h3>
					{canCreate && (
						<IconLinkButton.Save
							to={`/game/${gameId}/create-document`}
							title={t('create-document')}
						>
							<HiPlus />
						</IconLinkButton.Save>
					)}
				</div>
				<Folder
					gameId={gameId}
					hierarchy={docsResult.data.additional.hierarchy}
					id={null}
					allDocuments={docsResult.data.data}
					objectTypes={gameType.data.objectTypes}
				/>
			</section>
			{docsResult.data.additional.unrootedFolderIds.length ? (
				<section>
					<h3 className="flex-1 text-lg font-bold">{t('unrooted-header')}</h3>
					<Prose className="text-xs">{t('unrooted')}</Prose>

					<ul className="flex flex-col divide-y">
						{docsResult.data.additional.unrootedFolderIds.map((id) => {
							return (
								<li key={id}>
									<FolderEntry
										gameId={gameId}
										hierarchy={docsResult.data.additional.hierarchy}
										documentId={id}
										allDocuments={docsResult.data.data}
										objectTypes={gameType.data.objectTypes}
										recursive={false}
									/>
								</li>
							);
						})}
					</ul>
				</section>
			) : null}
		</div>
	);
}

function Folder({
	gameId,
	hierarchy,
	id,
	allDocuments,
	objectTypes,
	recursive = true,
}: {
	gameId: string;
	hierarchy: Map<string | null, FolderNode>;
	id: string | null;
	allDocuments: Map<string, DocumentSummary>;
	objectTypes: Record<string, GameTypeObjectScripts>;
	recursive?: boolean;
}) {
	const { t } = useTranslation(['game-objects']);
	const folder = hierarchy.get(id);
	if (!folder) return <Prose>{t('no-documents')}</Prose>;

	return (
		<ul>
			{Array.from(hierarchy.get(id)?.childrenIds ?? []).map((childId) => {
				const doc = allDocuments.get(childId);
				return (
					<li key={childId}>
						{recursive ? (
							<FolderEntry
								gameId={gameId}
								hierarchy={hierarchy}
								documentId={childId}
								allDocuments={allDocuments}
								objectTypes={objectTypes}
							/>
						) : doc ? (
							<DocumentLink
								gameId={gameId}
								document={doc}
								objectTypes={objectTypes}
							/>
						) : null}
					</li>
				);
			})}
		</ul>
	);
}

function FolderEntry({
	documentId,
	gameId,
	hierarchy,
	allDocuments,
	objectTypes,
	recursive = true,
}: {
	documentId: string;
	gameId: string;
	hierarchy: Map<string | null, FolderNode>;
	allDocuments: Map<string, DocumentSummary>;
	objectTypes: Record<string, GameTypeObjectScripts>;
	recursive?: boolean;
}) {
	const document = allDocuments.get(documentId);

	const nextFolder = hierarchy.get(documentId);

	// TODO: handle deeply nested documents with long names?
	return (
		<>
			{document && (
				<DocumentLink
					gameId={gameId}
					document={document}
					objectTypes={objectTypes}
				/>
			)}
			{nextFolder && (
				<div className="pl-2 ml-2 border-l border-l-slate-600 dark:border-l-slate-400">
					<Folder
						gameId={gameId}
						hierarchy={hierarchy}
						id={documentId}
						allDocuments={allDocuments}
						objectTypes={objectTypes}
						recursive={recursive}
					/>
				</div>
			)}
		</>
	);
}

function DocumentLink({
	gameId,
	document,
	objectTypes,
}: {
	gameId: string;
	document: DocumentSummary;
	objectTypes: Record<string, GameTypeObjectScripts>;
}) {
	const Icon = objectTypes[document.type].typeInfo.icon;
	return (
		<Link
			to={`/game/${gameId}/document/${document.id}`}
			className="flex flex-row items-center gap-2 hover:bg-white/25 dark:hover:bg-slate-950/25 p-1"
		>
			<Icon className="h-5 w-5 flex-shrink-0" />
			{document.name}
		</Link>
	);
}
