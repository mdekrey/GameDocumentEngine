import EditorJS from '@editorjs/editorjs';
import type { EditorConfig } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import { useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import styles from './EditorJSComponent.module.css';

type EditorJSComponentProps = Omit<
	EditorConfig,
	'holder' | 'tools' | 'styles' | 'hideToolbar'
> & {
	editorRef: React.MutableRefObject<EditorJS | undefined>;
	className?: string;
};

export function EditorJSComponent({
	editorRef,
	className,
	...config
}: EditorJSComponentProps) {
	const attachEditor = useRef((element: HTMLElement | null) => {
		console.log('attachEditor', element);
		if (editorRef.current) editorRef.current.destroy();
		if (!element) return;
		const editor = new EditorJS({
			holder: element,
			// inlineToolbar causes a crash right now
			// inlineToolbar: ['text', 'header'],
			...config,
			hideToolbar: false,

			tools: {
				header: {
					class: Header,
					inlineToolbar: true,
				},
				list: List,
			},
		});
		void editor.isReady.then(() => {
			editorRef.current = editor;
		});
	});
	return (
		<div
			className={twMerge(styles.editorJsContainer, className)}
			ref={attachEditor.current}
		/>
	);
}
