import type { WidgetComponentProps } from '@/documents/defineDocument';
import type { UserDetails } from '@/api/models/UserDetails';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type {
	GameTypeObjectScripts,
	GameTypeScripts,
} from '@/utils/api/queries/game-types';

export type RenderWidgetContentsProps = {
	component: React.ComponentType<WidgetComponentProps<unknown>>;
	translationNamespace?: string;
	translationKeyPrefix: string;
	document: DocumentDetails;
	user: UserDetails;
	gameType: GameTypeScripts;
	docType: GameTypeObjectScripts;
};
