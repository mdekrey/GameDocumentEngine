import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import {
	applyGridScale,
	fromGridCoordinate,
	gridSize,
	toGridCoordinate,
} from './grid-utils';
import { useStore } from 'jotai';
import { Rnd } from 'react-rnd';
import { useRef } from 'react';
import { elementTemplate } from '@/components/template';
import {
	applyConstraints,
	type PositionConstraints,
} from '@/documents/defineDocument';
import { useAtomSubscription } from '@/utils/useAtomSubscription';

const DragHandle = elementTemplate('DragHandle', 'div', (T) => (
	<T className="border-slate-900 dark:border-slate-100 absolute inset-1" />
)).themed({
	TopLeft: (T) => <T className="rounded-tl border-t border-l" />,
	TopRight: (T) => <T className="rounded-tr border-t border-r" />,
	BottomLeft: (T) => <T className="rounded-bl border-b border-l" />,
	BottomRight: (T) => <T className="rounded-br border-b border-r" />,
});

type Position = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export type MoveResizeWidgetProps = {
	field: FormFieldReturnType<Position>;
	children?: React.ReactNode;
	constraints: PositionConstraints;
};

export function MoveResizeWidget({
	field: positionField,
	children,
	constraints,
}: MoveResizeWidgetProps) {
	const store = useStore();
	const rndRef = useRef<Rnd>(null);
	const initialPosition = store.get(positionField.value);
	const positionAtom = positionField.value;

	useAtomSubscription(positionAtom, (position) => {
		const currentPosition = applyGridScale(position);
		rndRef.current?.updatePosition({
			x: currentPosition.x,
			y: currentPosition.y,
		});
		rndRef.current?.updateSize({
			width: currentPosition.width,
			height: currentPosition.height,
		});
	});
	return (
		<Rnd
			ref={rndRef}
			default={applyGridScale(initialPosition)}
			bounds="parent"
			dragGrid={[gridSize, gridSize]}
			resizeGrid={[gridSize, gridSize]}
			minWidth={constraints.min.width * gridSize}
			minHeight={constraints.min.height * gridSize}
			maxWidth={constraints.max?.width && constraints.max.width * gridSize}
			maxHeight={constraints.max?.height && constraints.max.height * gridSize}
			onDragStop={(e, d) => {
				positionField.onChange((prev) => ({
					...applyConstraints(constraints, prev),
					x: toGridCoordinate(Math.round(d.x)),
					y: toGridCoordinate(Math.round(d.y)),
				}));
			}}
			onResizeStop={(e, direction, ref, delta, position) => {
				positionField.onChange((prev) => {
					const result = {
						height: toGridCoordinate(
							fromGridCoordinate(prev.height) + Math.round(delta.height),
						),
						width: toGridCoordinate(
							fromGridCoordinate(prev.width) + Math.round(delta.width),
						),
						x: toGridCoordinate(Math.round(position.x)),
						y: toGridCoordinate(Math.round(position.y)),
					};
					return result;
				});
			}}
			resizeHandleComponent={{
				topLeft: <DragHandle.TopLeft />,
				topRight: <DragHandle.TopRight />,
				bottomLeft: <DragHandle.BottomLeft />,
				bottomRight: <DragHandle.BottomRight />,
			}}
		>
			{children}
		</Rnd>
	);
}
