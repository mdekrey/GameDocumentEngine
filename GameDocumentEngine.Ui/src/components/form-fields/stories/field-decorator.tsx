import type { Decorator } from '@storybook/react';
import { Fieldset } from '../fieldset/fieldset';

export const formFieldDecorator: Decorator = function formFieldDecorator(
	story,
) {
	return <Fieldset>{story()}</Fieldset>;
};
