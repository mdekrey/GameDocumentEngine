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

const DragHandle = elementTemplate('DragHandle', 'div', (T) => (
	<T className="border-slate-900 dark:border-slate-100 absolute inset-1" />
)).themed({
	TopLeft: (T) => <T className="rounded-tl border-t border-l" />,
	TopRight: (T) => <T className="rounded-tr border-t border-r" />,
	BottomLeft: (T) => <T className="rounded-bl border-b border-l" />,
	BottomRight: (T) => <T className="rounded-br border-b border-r" />,
});

export function MoveResizeWidget({
	field,
	children,
}: {
	field: FormFieldReturnType<Widget>;
	children?: React.ReactNode;
}) {
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
			onDragStop={(e, d) =>
				positionField.onChange((prev) => ({
					...prev,
					x: toGridCoordinate(d.x),
					y: toGridCoordinate(d.y),
				}))
			}
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
			<div className="absolute inset-0 bg-slate-50 dark:bg-slate-950"></div>
			{children}
			<div className="absolute inset-0 bg-slate-500/75 border border-black/50"></div>
		</Rnd>
	);
}
