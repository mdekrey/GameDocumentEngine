import type { Character } from '../character-types';
import type { FormFieldReturnType } from '@/utils/form';
import { useFormFields } from '@/utils/form';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import { TextareaField } from '@/components/form-fields/textarea-input/textarea-field';
import { Prose } from '@/components/text/common';
import styles from './aptitude.module.css';
import { useId } from 'react';
import { twMerge } from 'tailwind-merge';
import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';
import { CircularNumberField } from './CircularNumberField';

export function Aptitudes({ form }: GameObjectFormComponent<Character>) {
	const fields = useFormFields(form, {
		might: ['details', 'aptitudes', 'might'],
		deftness: ['details', 'aptitudes', 'deftness'],
		grit: ['details', 'aptitudes', 'grit'],
		insight: ['details', 'aptitudes', 'insight'],
		aura: ['details', 'aptitudes', 'aura'],
	});

	return (
		<div className="flex flex-col md:grid md:grid-cols-2 gap-8 justify-items-center items-center">
			<Aptitude field={fields.might} className={styles.might} />
			<Aptitude field={fields.deftness} className={styles.deftness} />
			<Aptitude field={fields.grit} className={styles.grit} />
			<Aptitude field={fields.insight} className={styles.insight} />
			<Aptitude field={fields.aura} className={styles.aura} />
		</div>
	);
}

function Aptitude({
	field,
	className,
}: {
	field: FormFieldReturnType<Character['aptitudes']['might']>;
	className?: string;
}) {
	const fields = useFormFields(field, {
		base: ['base'],
		trait: ['trait'],
		total: ['total'],
		modifiers: ['modifiers'],
	});

	return (
		<div className={twMerge(styles.aptitude, className)}>
			<h3 className={styles.title}>{field.translation('sectionHeader')}</h3>
			<Prose className={styles.hint}>{field.translation('sectionHint')}</Prose>
			<div className={styles.indicator}>
				<GradientSvg total={fields.total.atom} />
			</div>
			<CircularNumberField className={styles.base} field={fields.base} />
			<NumberField.Integer
				className={styles.trait}
				contentsClassName={styles.contents}
				labelClassName={styles.label}
				inputClassName={styles.input}
				field={fields.trait}
			/>
			<CircularNumberField.Main
				className={styles.total}
				field={fields.total}
				inputClassName={styles.input}
			/>
			<TextareaField
				className={styles.modifiers}
				contentsClassName={styles.contents}
				labelClassName={styles.label}
				field={fields.modifiers}
			/>
		</div>
	);
}

function GradientSvg({ total }: { total: Atom<number> }) {
	const gradientId = useId();
	const totalValue = useAtomValue(total);
	const gridOffset = 5;
	const gridSize = 16;
	const maxDisplayedValue = 20;
	const rectStroke = 2;
	const rectHeight = 16;

	const width = gridOffset + gridSize * maxDisplayedValue + rectStroke / 2;
	const height = 24;
	const rectTop = (height - rectHeight) / 2;
	const rectBottom = (height + rectHeight) / 2;

	return (
		<svg
			width={width}
			height={height}
			className="fill-transparent stroke-slate-800 dark:stroke-slate-200 -my-1"
			viewBox={`0 0 ${width} 24`}
		>
			<defs>
				<linearGradient id={gradientId}>
					<stop className={styles.stop1} offset="0%" />
					<stop className={styles.stop2} offset="100%" />
				</linearGradient>
			</defs>
			<rect
				x={0}
				y={rectTop}
				height={rectHeight}
				width={gridOffset + gridSize * totalValue}
				className="stroke-transparent transition-all"
				fill={`url(#${gradientId})`}
			/>
			<rect
				x={0}
				y={rectTop}
				height={rectHeight}
				width={gridOffset + gridSize * maxDisplayedValue}
				strokeWidth={rectStroke}
			/>
			{Array(20)
				.fill(0)
				.map((_, index) => index + 1)
				.map((value) => (
					<line
						key={value}
						x1={value * gridSize + gridOffset}
						x2={value * gridSize + gridOffset}
						{...(isMajor(value)
							? { y1: 0, y2: height, strokeWidth: 2 }
							: { y1: rectTop, y2: rectBottom, strokeWidth: 1 })}
					/>
				))}
		</svg>
	);
	function isMajor(index: number) {
		return index % 5 === 0;
	}
}
