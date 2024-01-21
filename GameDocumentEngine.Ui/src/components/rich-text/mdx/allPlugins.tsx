import '@mdxeditor/editor/style.css';
import type { RealmPlugin } from '@mdxeditor/editor';
import {
	KitchenSinkToolbar,
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
	diffSourcePlugin,
} from '@mdxeditor/editor';

export const readonlyPlugins: RealmPlugin[] = [
	listsPlugin(),
	quotePlugin(),
	headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
	linkPlugin(),
	linkDialogPlugin(),
	// imagePlugin({
	//   imageAutocompleteSuggestions: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
	//   imageUploadHandler: async () => Promise.resolve('https://picsum.photos/200/300')
	// }),
	tablePlugin(),
	thematicBreakPlugin(),
	codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
	diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: 'boo' }),
	markdownShortcutPlugin(),
];

export const allPlugins: RealmPlugin[] = [
	toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
	...readonlyPlugins,
];
