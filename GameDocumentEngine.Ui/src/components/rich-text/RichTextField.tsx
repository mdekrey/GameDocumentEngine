import { useAtomValue } from 'jotai';
import type { MDXEditorMethods } from '@mdxeditor/editor';
import { MDXEditor, diffSourcePlugin } from '@mdxeditor/editor';
import { Field } from '@/components/form-fields/field/field';
import type { StandardField } from '@/components/form-fields/FieldProps';
import { useRef } from 'react';
import { allPlugins, readonlyPlugins } from './allPlugins';
import styles from './mdx.module.css';
import { lexicalTheme } from './lexicalTheme';
import { twMerge } from 'tailwind-merge';
import { useAtomSubscription } from '@/utils/useAtomSubscription';

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
	const fieldAtom = field.value;
	useAtomSubscription(fieldAtom, (md) => {
		const newMarkdown = md ?? '';
		if (mdxEditorRef.current?.getMarkdown() === newMarkdown) return;
		mdxEditorRef.current?.setMarkdown(newMarkdown);
	});
	return (
		<Field noLabel className={className}>
			<Field.Label>{field.translation('label')}</Field.Label>
			<Field.Contents
				className={twMerge(
					!isDisabled || !isReadOnly ? 'border border-slate-500' : null,
				)}
			>
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
