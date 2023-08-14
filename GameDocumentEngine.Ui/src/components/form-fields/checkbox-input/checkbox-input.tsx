import { JotaiInput } from '../jotai/input';

export function CheckboxInput({
	type = 'checkbox',
	className,
	...props
}: React.ComponentProps<typeof JotaiInput>) {
	return <JotaiInput className={className} type={type} {...props} />;
}
