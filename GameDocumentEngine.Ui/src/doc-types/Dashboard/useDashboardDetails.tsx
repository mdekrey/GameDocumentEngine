import type { Atom } from 'jotai';
import type { Widget } from './types';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';

const positionTotalX = (p: Widget) => p.position.x + p.position.width;
const positionTotalY = (p: Widget) => p.position.y + p.position.height;
const widgetsTotal = (
	widgets: Record<string, Widget>,
	v: (p: Widget) => number,
) => Math.max(...Object.values(widgets).map(v)).toFixed(0);

export function useDashboardDetails(widgetsAtom: Atom<Record<string, Widget>>) {
	const dashboardHeight = useComputedAtom((get) =>
		widgetsTotal(get(widgetsAtom), positionTotalY),
	);
	const dashboardWidth = useComputedAtom((get) =>
		widgetsTotal(get(widgetsAtom), positionTotalX),
	);

	return { dashboardHeight, dashboardWidth };
}
