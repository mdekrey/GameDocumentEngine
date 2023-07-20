import { withSignal, mapProperty } from '@principlestudios/jotai-react-signals';

export const JotaiInput = withSignal('input', {
	defaultValue: mapProperty('value'),
	defaultChecked: mapProperty('checked'),
	disabled: mapProperty('disabled'),
});
