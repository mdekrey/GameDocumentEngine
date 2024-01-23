import '@mdxeditor/editor/style.css';
import type { RealmPlugin } from '@mdxeditor/editor';
import {
	headingsPlugin,
	toolbarPlugin,
	listsPlugin,
	quotePlugin,
	linkPlugin,
	linkDialogPlugin,
	tablePlugin,
	thematicBreakPlugin,
	codeBlockPlugin,
	markdownShortcutPlugin,
	codeMirrorPlugin,
	imagePlugin,
} from '@mdxeditor/editor';
import { Toolbar } from './toolbar';

export const readonlyPlugins: RealmPlugin[] = [
	listsPlugin(),
	quotePlugin(),
	headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
	linkPlugin(),
	linkDialogPlugin(),
	// ![test-image](https://via.placeholder.com/150)
	imagePlugin({
		imageUploadHandler: (data) => {
			return new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.addEventListener('error', reject);
				reader.addEventListener('load', () => resolve(reader.result as string));
				reader.readAsDataURL(data);
			});
		},
	}),
	tablePlugin(),
	thematicBreakPlugin(),
	codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
	codeMirrorPlugin({
		codeBlockLanguages: {
			js: 'JavaScript',
			css: 'CSS',
			txt: 'Text',
			tsx: 'TypeScript',
		},
	}),
	markdownShortcutPlugin(),
];

export const allPlugins: RealmPlugin[] = [
	toolbarPlugin({ toolbarContents: () => <Toolbar /> }),
	...readonlyPlugins,
];
