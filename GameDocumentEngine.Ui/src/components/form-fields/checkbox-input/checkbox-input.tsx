import { JotaiInput } from '../../jotai/input';

export function CheckboxInput({
	type = 'checkbox',
	className,
	...props
}: React.ComponentProps<typeof JotaiInput>) {
	const readonlyProps: React.ComponentProps<typeof JotaiInput> = props.readOnly
		? {
				'aria-readonly': true,
				onChange: (ev) => {
					ev.preventDefault();
				},
		  }
		: {};
	return (
		<JotaiInput
			className={className}
			type={type}
			{...props}
			{...readonlyProps}
		/>
	);
}
