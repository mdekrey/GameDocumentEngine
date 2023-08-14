import { Decorator } from '@storybook/react';
import { Fieldset } from '../fieldset/fieldset';

export const flyoutHeight: Decorator = function formFieldDecorator(story) {
	return <div style={{ height: '256px' }}>{story()}</div>;
};

export const formFieldDecorator: Decorator = function formFieldDecorator(
	story,
) {
	return <Fieldset>{story()}</Fieldset>;
};
