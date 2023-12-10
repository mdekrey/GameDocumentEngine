import type { WidgetComponentProps } from '@/documents/defineDocument';
import type { UserDetails } from '@/api/models/UserDetails';
import type { DocumentDetails } from '@/api/models/DocumentDetails';

export type RenderWidgetContentsProps = {
	component: React.ComponentType<WidgetComponentProps<unknown>>;
	document: DocumentDetails;
	user: UserDetails;
};