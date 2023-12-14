import { GetParams } from '../../utils/routing/getParams';

export function withParamsValue<const T extends string>(prop: T) {
	return <
		TProps extends {
			[P in T]: string;
		},
	>(
		Component: React.ComponentType<TProps>,
	): React.ComponentType<Omit<TProps, T>> => {
		return (props: Omit<TProps, T>) => (
			<GetParams>
				{(params: {
					[P in T]: string;
				}) => (
					// key is provided here to prvent reuse of a component when changing pages
					<Component
						key={params[prop]}
						{...({ ...props, [prop]: params[prop] } as TProps)}
					/>
				)}
			</GetParams>
		);
	};
}
