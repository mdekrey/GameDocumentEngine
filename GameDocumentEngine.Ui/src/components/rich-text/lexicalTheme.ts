import type { EditorThemeClasses } from 'lexical';
import styles from './mdx.module.css';

export const lexicalTheme: EditorThemeClasses = {
	paragraph: 'my-2',
	link: 'text-blue-800 dark:text-blue-300 underline',
	heading: {
		h1: 'mt-8 mb-2 text-5xl font-bold',
		h2: 'mt-7 mb-2 text-4xl font-bold',
		h3: 'mt-6 mb-2 text-3xl font-bold',
		h4: 'mt-5 mb-2 text-2xl font-bold',
		h5: 'mt-4 mb-2 text-xl font-bold',
		h6: 'mt-4 mb-2 text-lg font-bold',
	},

	text: {
		bold: 'font-bold',
		italic: 'italic',
		underline: 'underline',
		code: 'text-sm font-mono bg-slate-100 dark:bg-slate-900 border border-slate-500 p-0.5 rounded',
		strikethrough: 'strikethrough',
		subscript: 'font-xs align-sub',
		superscript: 'font-xs align-super',
		underlineStrikethrough: 'underline strikethrough',
	},

	quote: 'border-l-2 border-slate-500 pl-4',

	list: {
		ul: 'list-disc my-2 pl-6',
		ol: 'list-decimal my-2 pl-6',
		listitem: 'my-2',
		listitemChecked: styles.listItemChecked,
		listitemUnchecked: styles.listItemUnchecked,
		nested: {
			listitem: styles.nestedListItem,
		},
	},
};
