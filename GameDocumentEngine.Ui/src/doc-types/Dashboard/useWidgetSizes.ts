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
) => Math.max(0, ...Object.values(widgets).map(v));

export function getWidgetSizes(widgets: Record<string, PositionedWidget>) {
	const height = widgetsTotal(widgets, positionTotalY);
	const width = widgetsTotal(widgets, positionTotalX);
	return { height, width };
}

export function useWidgetSizes(
	widgetsAtom: Atom<Record<string, PositionedWidget>>,
) {
	const size = useComputedAtom((get) => getWidgetSizes(get(widgetsAtom)));
	const height = useComputedAtom((get) => get(size).height.toFixed(0));
	const width = useComputedAtom((get) => get(size).width.toFixed(0));

	return { height, width };
}
