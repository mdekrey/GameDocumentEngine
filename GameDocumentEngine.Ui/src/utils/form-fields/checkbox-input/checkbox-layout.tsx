import { withSlots } from 'react-slot-component';
import { twMerge } from 'tailwind-merge';
import { CheckboxHtmlProps } from '../../form/useField';
import { CheckboxInput } from './checkbox-input';

export type LayoutProps = CheckboxHtmlProps;

export type LayoutSlots = {
	Label: {
		className?: string;
		children?: React.ReactNode;
	};
	Contents: {
		className?: string;
		children?: React.ReactNode;
	};
};

// TODO - change this to CheckboxField and accept MappedFieldProps<TValue, boolean>
export const CheckboxLayout = withSlots<LayoutSlots, LayoutProps>(
	({ slotProps, ...checkboxProps }) => {
		const { className: labelClassName, children: labelChildren } =
			slotProps.Label ?? {};
		if (!labelChildren) throw new Error('No label provided for layout');
		const { className: contentsClassName, children: contentsChildren } =
			slotProps.Contents ?? {};

		return (
			<>
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
CheckboxLayout.displayName = 'CheckboxLayout';
