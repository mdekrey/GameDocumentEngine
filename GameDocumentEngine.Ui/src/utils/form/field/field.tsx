import { withSlots } from 'react-slot-component';
import { twMerge } from 'tailwind-merge';

export type FieldProps = { className?: string; children?: React.ReactNode };

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
	({ className, slotProps }) => {
		const { className: labelClassName, children: labelChildren } =
			slotProps.Label ?? {};
		if (!labelChildren) throw new Error('No label provided for field');
		const { className: contentsClassName, children: contentsChildren } =
			slotProps.Contents ?? {};

		return (
			<label className={twMerge('contents', className)}>
				<span className={twMerge('font-bold', labelClassName)}>Name</span>
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
