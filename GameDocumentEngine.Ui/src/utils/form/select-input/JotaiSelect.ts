import { withSignal, mapProperty } from '@principlestudios/jotai-react-signals';

export const JotaiSelect = withSignal('select', {
	defaultValue: mapProperty('value'),
});
