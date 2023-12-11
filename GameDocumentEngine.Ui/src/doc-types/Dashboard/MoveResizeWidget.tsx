import type { Widget } from './types';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import {
	applyGridScale,
	fromGridCoordinate,
	gridSize,
	toGridCoordinate,
} from './grid-utils';
import { useStore } from 'jotai';
import { Rnd } from 'react-rnd';
import { useEffect, useRef } from 'react';
import { elementTemplate } from '@/components/template';
import withSlots from 'react-slot-component';

const DragHandle = elementTemplate('DragHandle', 'div', (T) => (
	<T className="border-slate-900 dark:border-slate-100 absolute inset-1" />
)).themed({
	TopLeft: (T) => <T className="rounded-tl border-t border-l" />,
	TopRight: (T) => <T className="rounded-tr border-t border-r" />,
	BottomLeft: (T) => <T className="rounded-bl border-b border-l" />,
	BottomRight: (T) => <T className="rounded-br border-b border-r" />,
});

export type MoveResizeWidgetProps = {
	field: FormFieldReturnType<Widget>;
	children?: React.ReactNode;
};

export type MoveResizeWidgetSlots = {
	Buttons: {
		children?: React.ReactNode;
	};
};

export const MoveResizeWidget = withSlots<
	MoveResizeWidgetSlots,
	MoveResizeWidgetProps
>(function MoveResizeWidget({ field, children, slotProps }) {
	const store = useStore();
	const rndRef = useRef<Rnd>(null);
	const { positionField } = useFormFields(field, {
		positionField: ['position'] as const,
	});
	const initialPosition = store.get(positionField.value);
	const positionAtom = positionField.value;

	useEffect(() => {
		return store.sub(positionAtom, () => {
			const currentPosition = applyGridScale(store.get(positionAtom));
			rndRef.current?.updatePosition({
				x: currentPosition.x,
				y: currentPosition.y,
			});
			rndRef.current?.updateSize({
				width: currentPosition.width,
				height: currentPosition.height,
			});
		});
	}, [store, positionAtom]);
	return (
		<Rnd
			ref={rndRef}
			default={applyGridScale(initialPosition)}
			bounds="parent"
			dragGrid={[gridSize, gridSize]}
			resizeGrid={[gridSize, gridSize]}
			onDragStop={(e, d) => {
				positionField.onChange((prev) => ({
					...prev,
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
			<div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 -m-0.5 border-2 border-black/50 "></div>
			{children}
			<div className="absolute inset-0 bg-slate-500/75 flex flex-row flex-wrap justify-center items-center gap-4 opacity-0 hover:opacity-100 focus:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
				{slotProps.Buttons?.children}
			</div>
		</Rnd>
	);
});
