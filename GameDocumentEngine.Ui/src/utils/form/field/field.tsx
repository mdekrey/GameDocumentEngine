import { withSlots } from 'react-slot-component';
import { twMerge } from 'tailwind-merge';

export type FieldProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export type FieldSlots = {
	Label: {
		className?: string;
		children?: React.ReactNode;
	};
	Contents: {
		className?: string;
		children?: React.ReactNode;
	};
};

export const Field = withSlots<FieldSlots, FieldProps>(
	({ className, slotProps, ...props }) => {
		const { className: labelClassName, children: labelChildren } =
			slotProps.Label ?? {};
		if (!labelChildren) throw new Error('No label provided for field');
		const { className: contentsClassName, children: contentsChildren } =
			slotProps.Contents ?? {};

		return (
			<label className={twMerge('contents', className)} {...props}>
				<span className={twMerge('font-bold md:py-2', labelClassName)}>
					{labelChildren}
				</span>
				<div
					className={twMerge(
						'block flex-grow md:flex-grow-0',
						contentsClassName,
					)}
				>
					{contentsChildren}
				</div>
			</label>
		);
	},
);
Field.displayName = 'Field';
