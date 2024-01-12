import { elementTemplate } from '@/components/template';
import { twMerge } from 'tailwind-merge';
import styles from './dashboard.module.css';
import type { Widget } from './types';
import { JotaiDiv } from '@/components/jotai/div';
import type { Size } from '@/documents/defineDocument';

export const gridSize = 16;

export const fromGridCoordinate = (grid: number) => grid * gridSize;

export const toGridCoordinate = (client: number) =>
	Math.max(0, Math.floor(client / gridSize));

export const WidgetGridContainer = elementTemplate(
	'WidgetGridContainer',
	JotaiDiv,
	(T) => (
		<T
			className={twMerge(styles.widgetContainerGrid, 'relative')}
			style={{ '--grid-size': gridSize, '--grid-offset': 0 }}
		/>
	),
).themed({
	Editing: (T) => <T className={styles.editing} />,
});

export const DashboardContainer = WidgetGridContainer.extend(
	'DashboardContainer',
	(T) => <T className={styles.fullscreen} />,
).themed({
	Editing: (T) => <T className={styles.editing} />,
});

function applyGridScaleSize(size: Size) {
	return {
		width: size.width * gridSize,
		height: size.height * gridSize,
	};
}
export function applyGridScale(position: Widget['position']) {
	return {
		width: position.width * gridSize,
		height: position.height * gridSize,
		x: position.x * gridSize,
		y: position.y * gridSize,
	};
}

export const WidgetContainer = elementTemplate<
	'div',
	{ size: Size } & JSX.IntrinsicElements['div']
>('WidgetContainer', 'div', (T) => <T />, {
	useProps({ size, style, ...props }) {
		const scaled = applyGridScaleSize(size);
		return {
			...props,
			style: {
				...style,
				width: `${scaled.width}px`,
				height: `${scaled.height}px`,
			},
		};
	},
});

export const PositionedWidgetContainer = WidgetContainer.extend<
	{ position: Widget['position'] } & JSX.IntrinsicElements['div']
>('PositionedWidgetContainer', (T) => <T className="absolute" />, {
	useProps({ position, style, ...props }) {
		const scaled = applyGridScale(position);
		return {
			size: position,
			...props,
			style: {
				...style,
				left: `${scaled.x}px`,
				top: `${scaled.y}px`,
			},
		};
	},
});

export const DashboardToolsContainer = elementTemplate(
	'DashboardToolsContainer',
	'div',
	(T) => <T className="fixed right-4 bottom-4" />,
);
