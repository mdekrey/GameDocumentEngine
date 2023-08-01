import { JotaiInput } from '../jotai/input';

export function CheckboxInput({
	type = 'checkbox',
	className,
	...props
}: React.ComponentProps<typeof JotaiInput>) {
	console.log(props);
	return <JotaiInput className={className} type={type} {...props} />;
}
