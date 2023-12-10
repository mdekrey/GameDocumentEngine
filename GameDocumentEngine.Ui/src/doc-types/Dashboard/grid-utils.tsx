import { elementTemplate } from '@/components/template';
import { twMerge } from 'tailwind-merge';
import styles from './dashboard.module.css';
import type { Widget } from './types';

export const gridOffset = 16;
export const gridSize = 16;

export const toGridCoordinate = (client: number) =>
	Math.max(0, Math.floor((client - gridOffset) / gridSize));

export const DashboardContainer = elementTemplate(
	'DashboardContainer',
	'div',
	(T) => (
		<T
			className={twMerge(styles.dashboardGrid, 'relative')}
			style={{ '--grid-size': gridSize, '--grid-offset': gridOffset }}
		/>
	),
).themed({
	Editing: (T) => <T className={styles.editing} />,
});

export const WidgetContainer = elementTemplate<
	'div',
	{ position: Widget['position'] } & JSX.IntrinsicElements['div']
>('WidgetContainer', 'div', (T) => <T className="overflow-hidden absolute" />, {
	useProps({ position, style, ...props }) {
		return {
			...props,
			style: {
				...style,
				width: `${position.width * gridSize}px`,
				height: `${position.height * gridSize}px`,
				left: `${position.x * gridSize + gridOffset}px`,
				top: `${position.y * gridSize + gridOffset}px`,
			},
		};
	},
});
