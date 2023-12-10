import { elementTemplate } from '@/components/template';
import { twMerge } from 'tailwind-merge';
import styles from './dashboard.module.css';
import type { Widget } from './types';

export const gridSize = 16;

export const fromGridCoordinate = (grid: number) => grid * gridSize;

export const toGridCoordinate = (client: number) =>
	Math.max(0, Math.floor(client / gridSize));

export const DashboardContainer = elementTemplate(
	'DashboardContainer',
	'div',
	(T) => (
		<T
			className={twMerge(styles.dashboardGrid, 'relative')}
			style={{ '--grid-size': gridSize, '--grid-offset': 0 }}
		/>
	),
).themed({
	Editing: (T) => <T className={styles.editing} />,
});

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
	{ position: Widget['position'] } & JSX.IntrinsicElements['div']
>('WidgetContainer', 'div', (T) => <T className="absolute" />, {
	useProps({ position, style, ...props }) {
		const scaled = applyGridScale(position);
		return {
			...props,
			style: {
				...style,
				width: `${scaled.width}px`,
				height: `${scaled.height}px`,
				left: `${scaled.x}px`,
				top: `${scaled.y}px`,
			},
		};
	},
});
