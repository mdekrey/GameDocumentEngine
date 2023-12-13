import type {
	WidgetComponentProps,
	GameObjectWidgetDefinition,
} from '@/documents/defineDocument';

export function NamedIconWidget({
	document,
	docType: {
		typeInfo: { icon: Icon },
	},
	translation: t,
	size,
}: WidgetComponentProps<unknown, void>) {
	if (size.width === 2) {
		return (
			<div className="h-full text-xl font-bold flex flex-row items-center justify-center">
				<Icon title={t('name')} className="flex-shrink-0" />
			</div>
		);
	}
	return (
		<div className="h-full text-xl font-bold flex flex-row items-center overflow-hidden">
			<Icon title={t('name')} className="flex-shrink-0" />
			{size.width > 2 && (
				<span className="flex-1 overflow-ellipsis whitespace-nowrap overflow-hidden">
					{' '}
					{document.name}
				</span>
			)}
		</div>
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
		settingsComponent: undefined,
		defaultSettings: {},
	};
