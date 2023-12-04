import { elementTemplate } from '@/components/template';
import { Prose } from '@/components/text/common';
import styles from './atoms.module.css';
import { twMerge } from 'tailwind-merge';
import { type LuSword } from 'react-icons/lu';

export const Container = elementTemplate<'div'>(
	'Container',
	<div className={styles.container} />,
);

export const CardIcon = ({ icon: Icon }: { icon: typeof LuSword }) => {
	return (
		<Icon
			className={twMerge(
				styles.icon,
				'text-2xl self-center justify-self-center',
			)}
		/>
	);
};
export const CardTitle = Prose.extend(
	'CardTitle',
	<h2
		className={twMerge(
			styles.title,
			'text-xl font-bold border-slate-700 dark:border-slate-300',
		)}
	/>,
	{ overrideType: true },
);

export const CardHint = Prose.extend('CardHint', <p className={styles.hint} />);
export const CardBase = Prose.extend(
	'CardBase',
	<div className={styles.base} />,
);
export const CardContents = Prose.extend(
	'CardContents',
	<div className={styles.contents} />,
);
