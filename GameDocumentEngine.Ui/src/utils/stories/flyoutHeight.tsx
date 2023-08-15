import { Decorator } from '@storybook/react';

export const flyoutHeight: Decorator = (story) => {
	return <div style={{ height: '256px' }}>{story()}</div>;
};
