import type { Widget } from './types';
import type { FormFieldReturnType } from '@principlestudios/react-jotai-forms';
import { useFormFields } from '@principlestudios/react-jotai-forms';
import {
	applyGridScale,
	fromGridCoordinate,
	gridSize,
	toGridCoordinate,
} from './grid-utils';
import { useAtomValue } from 'jotai';
import { Rnd } from 'react-rnd';

export function MoveResizeWidget({
	field,
	children,
}: {
	field: FormFieldReturnType<Widget>;
	children?: React.ReactNode;
}) {
	const { positionField } = useFormFields(field, {
		positionField: ['position'] as const,
	});
	const p = useAtomValue(positionField.value);
	return (
		<Rnd
			default={applyGridScale(p)}
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
				console.log(e, direction, ref, delta, position);
				positionField.onChange((prev) => {
					const result = {
						height: toGridCoordinate(
							fromGridCoordinate(prev.height) + delta.height,
						),
						width: toGridCoordinate(
							fromGridCoordinate(prev.width) + delta.width,
						),
						x: toGridCoordinate(position.x),
						y: toGridCoordinate(position.y),
					};
					console.log(result);
					return result;
				});
			}}
		>
			{children}
			<div className="bg-slate-500/25 absolute inset-0 border-4 border-black/50 dark:bg-slate-50/50"></div>
		</Rnd>
	);
}
