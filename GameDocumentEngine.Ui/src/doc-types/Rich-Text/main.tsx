import type { GameObjectFormComponent } from '@/documents/defineDocument';
import type { RichText } from './types';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import EditorJS from '@editorjs/editorjs';
import { useCallback, useRef } from 'react';
import { TextField } from '@/components/form-fields/text-input/text-field';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';

export function RichTextMain(props: GameObjectFormComponent<RichText>) {
	useSubmitOnChange(props.form, props.onSubmit);

	return (
		<>
			<Fieldset>
				<TextField field={props.form.field(['name'])} />
			</Fieldset>
			<EditorJSContainer />
		</>
	);
}

function EditorJSContainer({ className }: { className?: string }) {
	const editorRef = useRef<EditorJS>();
	const attachEditor = useCallback((element: HTMLElement | null) => {
		if (!element) return;
		editorRef.current = new EditorJS({
			holder: element,
			autofocus: true,
			onChange(api, event) {
				console.log(event);
			},
			tools: {
				header: Header,
				list: List,
			},
		});
	}, []);
	return <div className={className} ref={attachEditor} />;
}
