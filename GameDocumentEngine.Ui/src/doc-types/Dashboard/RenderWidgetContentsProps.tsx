import type {
	WidgetBase,
	WidgetComponentProps,
} from '@/documents/defineDocument';
import type { UserDetails } from '@/api/models/UserDetails';
import type { DocumentDetails } from '@/api/models/DocumentDetails';
import type {
	GameTypeObjectScripts,
	GameTypeScripts,
} from '@/utils/api/queries/game-types';
import type { Widget } from './types';

export type RenderWidgetContentsProps<T, TWidget extends WidgetBase> = {
	component: React.ComponentType<WidgetComponentProps<T, TWidget>>;
	translationNamespace?: string;
	translationKeyPrefix: string;
	document: DocumentDetails;
	user: UserDetails;
	gameType: GameTypeScripts;
	docType: GameTypeObjectScripts<T>;
	widgetConfig: Widget<TWidget>;
};
