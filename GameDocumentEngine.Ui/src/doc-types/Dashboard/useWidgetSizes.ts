import type { Atom } from 'jotai';
import type { WidgetPosition } from './types';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';

type PositionedWidget = { position: WidgetPosition };

const positionTotalX = (p: PositionedWidget) => p.position.x + p.position.width;
const positionTotalY = (p: PositionedWidget) =>
	p.position.y + p.position.height;
const widgetsTotal = (
	widgets: Record<string, PositionedWidget>,
	v: (p: PositionedWidget) => number,
) => Math.max(...Object.values(widgets).map(v)).toFixed(0);

export function useWidgetSizes(
	widgetsAtom: Atom<Record<string, PositionedWidget>>,
) {
	const dashboardHeight = useComputedAtom((get) =>
		widgetsTotal(get(widgetsAtom), positionTotalY),
	);
	const dashboardWidth = useComputedAtom((get) =>
		widgetsTotal(get(widgetsAtom), positionTotalX),
	);

	return { dashboardHeight, dashboardWidth };
}
