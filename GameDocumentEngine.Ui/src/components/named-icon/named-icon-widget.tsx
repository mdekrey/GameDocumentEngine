import type {
	WidgetComponentProps,
	GameObjectWidgetDefinition,
} from '@/documents/defineDocument';

export function NamedIconWidget({
	document,
	docType: {
		typeInfo: { icon: Icon },
	},
	translation: t, // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: WidgetComponentProps<unknown>) {
	return (
		<div className="h-full text-xl font-bold flex flex-row items-center overflow-hidden">
			<Icon
				title={t('name')}
				className="flex-shrink-0 inline-block align-baseline"
			/>
			<span className="flex-1 overflow-ellipsis whitespace-nowrap overflow-hidden">
				{' '}
				{document.name}
			</span>
		</div>
	);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const NamedIconWidgetDefinition: GameObjectWidgetDefinition<any> = {
	component: NamedIconWidget,
	defaults: { width: 10, height: 2 },
	translationNamespace: 'widgets/name',
	translationKeyPrefix: '',
	getConstraints() {
		return { min: { width: 2, height: 2 }, max: { height: 2 } };
	},
};
