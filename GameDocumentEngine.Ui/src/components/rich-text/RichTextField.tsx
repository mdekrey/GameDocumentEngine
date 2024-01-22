import { useAtomValue, useStore } from 'jotai';
import type { MDXEditorMethods } from '@mdxeditor/editor';
import { MDXEditor, diffSourcePlugin } from '@mdxeditor/editor';
import { Field } from '@/components/form-fields/field/field';
import type { StandardField } from '@/components/form-fields/FieldProps';
import { useEffect, useRef } from 'react';
import { allPlugins, readonlyPlugins } from './allPlugins';
import styles from './mdx.module.css';
import { lexicalTheme } from './lexicalTheme';

export function RichTextField({
	className,
	field,
}: {
	className?: string;
	field: StandardField<string | undefined>;
}) {
	const isDisabled = useAtomValue(field.disabled);
	const isReadOnly = useAtomValue(field.readOnly);
	const mdxEditorRef = useRef<MDXEditorMethods>(null);
	const store = useStore();
	const fieldAtom = field.value;
	useEffect(() => {
		return store.sub(fieldAtom, () => {
			const newMarkdown = store.get(fieldAtom) ?? '';
			if (mdxEditorRef.current?.getMarkdown() === newMarkdown) return;
			mdxEditorRef.current?.setMarkdown(newMarkdown);
		});
	}, [fieldAtom, store]);
	return (
		<Field noLabel className={className}>
			<Field.Label>{field.translation('label')}</Field.Label>
			<Field.Contents className="border border-slate-500 mt-2">
				<MDXEditor
					markdown={field.getValue() ?? ''}
					className={styles.root}
					lexicalTheme={lexicalTheme}
					contentEditableClassName={styles.content}
					readOnly={isDisabled || isReadOnly}
					key={isDisabled || isReadOnly ? 'readonly' : 'writable'}
					plugins={
						isDisabled || isReadOnly
							? readonlyPlugins
							: [
									...allPlugins,
									diffSourcePlugin({
										viewMode: 'rich-text',
										diffMarkdown: field.getValue() ?? '',
									}),
							  ]
					}
					ref={mdxEditorRef}
					onChange={field.onChange}
				/>
			</Field.Contents>
		</Field>
	);
}
