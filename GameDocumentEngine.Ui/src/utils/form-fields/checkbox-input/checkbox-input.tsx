import { twMerge } from 'tailwind-merge';
import { JotaiInput } from '../text-input/JotaiInput';

export function CheckboxInput({
	type = 'checkbox',
	className,
	...props
}: React.ComponentProps<typeof JotaiInput>) {
	console.log(props);
	return (
		<JotaiInput className={twMerge('', className)} type={type} {...props} />
	);
}
