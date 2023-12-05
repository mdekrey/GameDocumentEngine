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
			<NumberField.Integer className={styles.trait} field={fields.trait} />
			<CircularNumberField.Main className={styles.total} field={fields.total} />
			<TextareaField className={styles.modifiers} field={fields.modifiers} />
		</div>
	);
}

function GradientSvg({ total }: { total: Atom<number> }) {
	const gradientId = useId();
	const totalValue = useAtomValue(total);

	return (
		<svg
			width={340}
			height={24}
			className="fill-transparent stroke-slate-800 dark:stroke-slate-200 -my-1"
			viewBox="0 0 340 24"
		>
			<defs>
				<linearGradient id={gradientId}>
					<stop className={styles.stop1} offset="0%" />
					<stop className={styles.stop2} offset="100%" />
				</linearGradient>
			</defs>
			<rect
				x={0}
				y={4}
				height={16}
				width={5 + 16 * totalValue}
				className="stroke-transparent transition-all"
				fill={`url(#${gradientId})`}
			/>
			<rect x={0} y={4} height={16} width={325} strokeWidth={2} />
			{Array(20)
				.fill(0)
				.map((_, index) => (
					<line
						key={index}
						x1={(index + 1) * 16 + 5}
						x2={(index + 1) * 16 + 5}
						y1={index % 5 == 4 ? 0 : 4}
						y2={index % 5 == 4 ? 24 : 20}
						strokeWidth={index % 5 == 4 ? 2 : 1}
					/>
				))}
		</svg>
	);
}
