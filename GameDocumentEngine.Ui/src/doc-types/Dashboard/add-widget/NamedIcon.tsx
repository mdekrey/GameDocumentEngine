import type { IconType } from 'react-icons';

export const NamedIcon = ({
	icon: Icon,
	name,
	typeName,
}: {
	icon: IconType;
	name: string;
	typeName: string;
}) => (
	<span className="font-semibold">
		<Icon title={typeName} className="inline-block align-baseline" />
		{name}
	</span>
);
