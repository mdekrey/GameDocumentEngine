import { themes, create } from '@storybook/theming';
import { colors } from '../src/stories/tailwind-info';

console.log(colors);

export const theme = create({
	base: 'dark',
});
