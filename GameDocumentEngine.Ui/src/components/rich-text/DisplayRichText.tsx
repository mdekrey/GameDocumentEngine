import type EditorJS from '@editorjs/editorjs';
import { useRef } from 'react';
import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';
import type { RichTextData } from './type';
import { EditorJSComponent } from './EditorJSComponent';
import styles from './EditorJSComponent.module.css';

export function DisplayRichText({
	data: dataAtom,
	className,
}: {
	data: Atom<RichTextData> | Atom<RichTextData | undefined>;
	className?: string;
}) {
	const data = useAtomValue(dataAtom);
	const editorRef = useRef<EditorJS>();
	if (editorRef.current?.render && data)
		void updateEditor(editorRef.current, data);

	return (
		<EditorJSComponent
			className={
				className ? `${styles.readOnly} ${className}` : styles.readOnly
			}
			editorRef={editorRef}
			data={data}
			readOnly={true}
			minHeight={0}
		/>
	);
}

async function updateEditor(editor: EditorJS, data: RichTextData) {
	for (let i = 0; i < data.blocks.length; i++) {
		const block = data.blocks[i];
		if (!block.id) throw new Error(`all blocks must have an id; ${i} did not`);
		const currentIndex: number | undefined = editor.blocks.getBlockIndex(
			block.id,
		);
		const currentCount = editor.blocks.getBlocksCount();
		if (currentIndex !== undefined && currentIndex < currentCount) {
			await editor.blocks.update(block.id, block.data).catch(() => {
				// this prevents unnecessary errors
			});
			if (currentIndex !== i) editor.blocks.move(i, currentIndex);
		} else {
			editor.blocks.insert(
				block.type,
				block.data,
				undefined,
				i >= currentCount ? undefined : i,
				false,
				false,
				block.id,
			);
		}
	}

	const blocksCount = editor.blocks.getBlocksCount();
	for (let i = data.blocks.length; i < blocksCount; i++) {
		editor.blocks.delete(data.blocks.length);
	}
}
