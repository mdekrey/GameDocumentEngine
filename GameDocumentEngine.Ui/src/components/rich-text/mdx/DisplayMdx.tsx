import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';
import { MDXEditor } from '@mdxeditor/editor';
import { readonlyPlugins } from './allPlugins';
import styles from './mdx.module.css';
import { lexicalTheme } from './lexicalTheme';

export function DisplayMdx({
	data: dataAtom,
}: {
	data: Atom<string> | Atom<string | undefined>;
}) {
	const data = useAtomValue(dataAtom);

	return (
		<MDXEditor
			markdown={data ?? ''}
			key={data ?? ''}
			className={styles.root}
			lexicalTheme={lexicalTheme}
			contentEditableClassName={styles.content}
			readOnly={true}
			plugins={readonlyPlugins}
		/>
	);
}
