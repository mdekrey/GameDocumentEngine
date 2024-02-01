import { useTranslation } from 'react-i18next';
import { GameRoles } from './game-roles/game-roles';
import { GameInvites } from './game-invites/game-invites';
import { GameEdit } from './game-edit/game-edit';
import {
	Section,
	SectionHeader,
	SingleColumnSections,
} from '@/components/sections';
import {
	listInvitations,
	updateGame,
	updateGameUserAccess,
} from '@/utils/security/permission-strings';
import { hasGamePermission } from '@/utils/security/match-permission';
import {
	displayDangerZone,
	GameDangerZone,
} from './game-danger-zone/game-danger-zone';
import type { GameDetails } from '@vaultvtt/api/openapi/models/GameDetails';
import { Suspense } from 'react';
import { useGame } from '@/utils/api/hooks';

function displayInvites(gameDetails: GameDetails) {
	return hasGamePermission(gameDetails, listInvitations);
}

export function displayGameSettings(gameDetails: GameDetails) {
	return (
		hasGamePermission(gameDetails, updateGame) ||
		hasGamePermission(gameDetails, updateGameUserAccess) ||
		displayInvites(gameDetails) ||
		displayDangerZone(gameDetails)
	);
}

export function GameSettings({ gameId }: { gameId: string }) {
	const { t } = useTranslation('game-settings');
	const gameDetails = useGame(gameId);
	const showInvites = displayInvites(gameDetails);

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
					<Suspense>
						<GameInvites gameId={gameId} />
					</Suspense>
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
