import { Atom, useAtomValue } from 'jotai';

export function AtomContents({
	children,
}: {
	children: Atom<React.ReactNode>;
}) {
	const value = useAtomValue(children);
	return <>{value}</>;
}
