import { useParams } from 'react-router-dom';

export function GetParams<T extends Record<string, string | undefined>>({
	children,
}: {
	children: (params: T) => React.ReactNode;
}) {
	return children(useParams() as T);
}
