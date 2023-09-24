import { IconLinkButton } from '@/components/button/icon-link-button';
import { queries } from '@/utils/api/queries';
import { useQuery } from '@tanstack/react-query';
import { HiPlus, HiChevronRight } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { useGameType } from '../documents/useGameType';
import { useTranslation } from 'react-i18next';
import { hasGamePermission } from '@/utils/security/match-permission';
import { createDocument } from '@/utils/security/permission-strings';

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

	return (
		<div className="h-full p-4 flex flex-col gap-2">
			<Link
				to={`/game/${gameId}`}
				className="text-xl font-bold flex flex-row justify-between items-center gap-2 hover:bg-white/25 dark:hover:bg-slate-950/25 p-1"
			>
				{gameDetails.data.name}

				<HiChevronRight className="h-5 w-5" />
			</Link>

			<section className="flex flex-col">
				<div className="flex flex-row gap-3 p-1">
					<Link to={`/game/${gameId}`} className="flex-1 text-lg font-bold">
						{t('header')}
					</Link>
					{canCreate && (
						<IconLinkButton.Save
							to={`/game/${gameId}/create-document`}
							title={t('create-document')}
						>
							<HiPlus />
						</IconLinkButton.Save>
					)}
				</div>
				<ul className={'contents'}>
					{Array.from(docsResult.data.values()).map((s) => {
						const Icon = gameType.data.objectTypes[s.type].typeInfo.icon;
						return (
							<li key={s.id} className="contents">
								<Link
									to={`/game/${gameId}/document/${s.id}`}
									className="flex flex-row items-center gap-2 hover:bg-white/25 dark:hover:bg-slate-950/25 p-1"
								>
									<Icon className="h-5 w-5" />
									{s.name}
								</Link>
							</li>
						);
					})}
				</ul>
			</section>
		</div>
	);
}
