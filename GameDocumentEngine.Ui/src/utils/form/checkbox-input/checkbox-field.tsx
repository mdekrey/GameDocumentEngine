import { withSlots } from 'react-slot-component';
import { twMerge } from 'tailwind-merge';
import { CheckboxFieldProps } from '../useField';
import { CheckboxInput } from './checkbox-input';

export type FieldProps = CheckboxFieldProps<boolean>;

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

export const CheckboxField = withSlots<FieldSlots, FieldProps>(
	({ slotProps, ...checkboxProps }) => {
		const { className: labelClassName, children: labelChildren } =
			slotProps.Label ?? {};
		if (!labelChildren) throw new Error('No label provided for field');
		const { className: contentsClassName, children: contentsChildren } =
			slotProps.Contents ?? {};

		return (
			<>
				<span />
				<label className={twMerge('font-bold md:py-2', labelClassName)}>
					<CheckboxInput {...checkboxProps} /> {labelChildren}
					{contentsChildren && (
						<div
							className={twMerge(
								'block flex-grow md:flex-grow-0',
								contentsClassName,
							)}
						>
							{contentsChildren}
						</div>
					)}
				</label>
			</>
		);
	},
);
CheckboxField.displayName = 'CheckboxField';
