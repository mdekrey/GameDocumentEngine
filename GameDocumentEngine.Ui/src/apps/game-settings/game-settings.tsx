import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import { GameRoles } from './game-roles/game-roles';
import { GameInvites } from './game-invites/game-invites';
import { GameEdit } from './game-edit/game-edit';
import {
	Section,
	SectionHeader,
	SingleColumnSections,
} from '@/components/sections';
import { listInvitations } from '@/utils/security/permission-strings';
import { hasGamePermission } from '@/utils/security/match-permission';
import {
	displayDangerZone,
	GameDangerZone,
} from './game-danger-zone/game-danger-zone';

export function GameSettings({ gameId }: { gameId: string }) {
	const { t } = useTranslation('game-settings');
	const gameResult = useQuery(queries.getGameDetails(gameId));

	if (gameResult.isLoading) {
		return 'Loading';
	}
	if (!gameResult.isSuccess) {
		return 'An error occurred loading the game.';
	}

	const gameDetails = gameResult.data;
	const showInvites = hasGamePermission(gameDetails, listInvitations);

	return (
		<SingleColumnSections>
			<Section>
				<SectionHeader>{t('configure-details')}</SectionHeader>
				<GameEdit gameId={gameId} />
			</Section>
			<Section>
				<SectionHeader>{t('configure-roles')}</SectionHeader>
				<GameRoles gameId={gameId} />
			</Section>
			{showInvites && (
				<Section>
					<SectionHeader>{t('configure-invites')}</SectionHeader>
					<GameInvites gameId={gameId} />
				</Section>
			)}
			{displayDangerZone(gameDetails) && (
				<Section className="flex flex-col gap-2">
					<SectionHeader>{t('danger-zone')}</SectionHeader>
					<GameDangerZone gameId={gameId} />
				</Section>
			)}
		</SingleColumnSections>
	);
}
