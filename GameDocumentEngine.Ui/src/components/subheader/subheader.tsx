import type { To } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { elementTemplate } from '../template';

export const SubheaderContainer = elementTemplate(
	'SubheaderContainer',
	'div',
	(T) => <T className="flex flex-row gap-3" />,
);
export const SubheaderTitle = elementTemplate('SubheaderTitle', 'h1', (T) => (
	<T className="text-2xl font-bold flex-1 overflow-hidden text-ellipsis whitespace-nowrap" />
));

export function Subheader({
	title,
	to,
	children,
}: {
	title: React.ReactNode;
	to: To;
	children?: React.ReactNode;
}) {
	return (
		<SubheaderContainer>
			<SubheaderTitle>
				<Link to={to}>{title}</Link>
			</SubheaderTitle>
			{children}
		</SubheaderContainer>
	);
}
