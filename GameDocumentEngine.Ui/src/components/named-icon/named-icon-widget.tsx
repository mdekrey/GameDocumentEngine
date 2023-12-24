import {
	type WidgetComponentProps,
	type GameObjectWidgetDefinition,
} from '@/documents/defineDocument';
import {
	useTranslationForDocument,
	useTypeOfDocument,
} from '@/utils/api/hooks';
import { Link } from 'react-router-dom';
import { elementTemplate } from '../template';

const NamedLink = elementTemplate('NamedLink', Link, (T) => (
	<T className="h-full text-xl font-bold flex flex-row items-center" />
));

export function NamedIconWidget({
	document,
	widgetType,
	size,
}: WidgetComponentProps<unknown, void>) {
	const t = useTranslationForDocument(document, widgetType);
	const Icon = useTypeOfDocument(document).typeInfo.icon;
	const path = `/game/${document.gameId}/document/${document.id}`;
	if (size.width === 2) {
		return (
			<NamedLink to={path} className="justify-center">
				<Icon title={t('name')} className="flex-shrink-0" />
			</NamedLink>
		);
	}
	return (
		<NamedLink to={path} className="overflow-hidden">
			<Icon title={t('name')} className="flex-shrink-0" />
			{size.width > 2 && (
				<span className="flex-1 overflow-ellipsis whitespace-nowrap overflow-hidden">
					{' '}
					{document.name}
				</span>
			)}
		</NamedLink>
	);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const NamedIconWidgetDefinition: GameObjectWidgetDefinition<any, void> =
	{
		component: NamedIconWidget,
		defaults: { width: 10, height: 2 },
		translationNamespace: 'widgets/name',
		translationKeyPrefix: '',
		getConstraints() {
			return { min: { width: 2, height: 2 }, max: { height: 2 } };
		},
		settings: null,
	};
