import type { Atom } from 'jotai';
import { useStore } from 'jotai';
import type { MDXEditorMethods } from '@mdxeditor/editor';
import { MDXEditor } from '@mdxeditor/editor';
import { readonlyPlugins } from './allPlugins';
import styles from './mdx.module.css';
import { lexicalTheme } from './lexicalTheme';
import { useEffect, useRef } from 'react';
import { useAsAtom } from '@principlestudios/jotai-react-signals';

export function DisplayMdx({
	data,
}: {
	data: string | Atom<string> | Atom<string | undefined>;
}) {
	const dataAtom = useAsAtom(data);
	const store = useStore();
	const mdxEditorRef = useRef<MDXEditorMethods>(null);
	useEffect(() => {
		mdxEditorRef.current?.setMarkdown(store.get(dataAtom) ?? '');
		return store.sub(dataAtom, () => {
			console.log('update');
			mdxEditorRef.current?.setMarkdown(store.get(dataAtom) ?? '');
		});
	}, [dataAtom, store]);

	return (
		<MDXEditor
			ref={mdxEditorRef}
			markdown={store.get(dataAtom) ?? ''}
			className={styles.root}
			lexicalTheme={lexicalTheme}
			contentEditableClassName={styles.content}
			readOnly={true}
			plugins={readonlyPlugins}
		/>
	);
}
