import type { EditorThemeClasses } from 'lexical';
import styles from './mdx.module.css';

export const lexicalTheme: EditorThemeClasses = {
	paragraph: 'my-2',
	heading: {
		h1: 'text-5xl font-bold',
		h2: 'text-4xl font-bold',
		h3: 'text-3xl font-bold',
		h4: 'text-2xl font-bold',
		h5: 'text-xl font-bold',
		h6: 'text-lg font-bold',
	},

	text: {
		bold: 'font-bold',
		italic: 'italic',
		underline: 'underline',
		code: 'text-sm font-mono bg-slate-100 dark:bg-slate-900 border border-slate-500 p-px',
		strikethrough: 'strikethrough',
		subscript: 'font-xs align-sub',
		superscript: 'font-xs align-super',
		underlineStrikethrough: 'underline strikethrough',
	},

	quote: 'border-l-2 border-slate-500 pl-4',

	list: {
		listitem: styles.listitem,
		listitemChecked: styles.listItemChecked,
		listitemUnchecked: styles.listItemUnchecked,
		nested: {
			listitem: styles.nestedListItem,
		},
	},
};
