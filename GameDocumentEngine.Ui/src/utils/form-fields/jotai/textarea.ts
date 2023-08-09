import { withSignal, mapProperty } from '@principlestudios/jotai-react-signals';

export const JotaiTextarea = withSignal('textarea', {
	defaultValue: mapProperty('value'),
	disabled: mapProperty('disabled'),
	className: mapProperty('className'),
});
