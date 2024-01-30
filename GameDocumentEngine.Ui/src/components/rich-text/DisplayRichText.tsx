import type { Atom } from 'jotai';
import { useStore } from 'jotai';
import type { MDXEditorMethods } from '@mdxeditor/editor';
import { MDXEditor } from '@mdxeditor/editor';
import { readonlyPlugins } from './allPlugins';
import styles from './mdx.module.css';
import { lexicalTheme } from './lexicalTheme';
import { useRef } from 'react';
import { useAsAtom } from '@principlestudios/jotai-react-signals';
import { useAtomSubscription } from '@/utils/useAtomSubscription';

export function DisplayRichText({
	data,
}: {
	data: string | Atom<string> | Atom<string | undefined>;
}) {
	const dataAtom = useAsAtom(data);
	const store = useStore();
	const mdxEditorRef = useRef<MDXEditorMethods>(null);
	useAtomSubscription(
		dataAtom,
		(md) => {
			mdxEditorRef.current?.setMarkdown(md ?? '');
		},
		true,
	);

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
