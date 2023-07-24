import { IconLinkButton } from '@/components/button/icon-link-button';
import { queries } from '@/utils/api/queries';
import { useQuery } from '@tanstack/react-query';
import { HiPlus } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import { useGameType } from '../documents/useGameType';
import { useTranslation } from 'react-i18next';

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

	return (
		<>
			<div className="flex flex-row gap-3">
				<Link to={`/game/${gameId}`} className="flex-1 text-lg font-bold">
					{gameDetails.data.name}
				</Link>
				<IconLinkButton.Save
					to={`/game/${gameId}/create-document`}
					title={t('create-document')}
				>
					<HiPlus />
				</IconLinkButton.Save>
			</div>
			<ul>
				{Object.values(docsResult.data).map((s) => {
					const Icon = gameType.data.objectTypes[s.type].typeInfo.icon;
					return (
						<li key={s.id}>
							<Link
								to={`/game/${gameId}/document/${s.id}`}
								className="flex flex-row items-center gap-2"
							>
								<Icon className="h-5 w-5" /> {s.name}
							</Link>
						</li>
					);
				})}
			</ul>
		</>
	);
}
