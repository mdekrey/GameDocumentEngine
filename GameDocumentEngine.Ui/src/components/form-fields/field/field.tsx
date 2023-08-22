import { Atom } from 'jotai';
import { withSlots } from 'react-slot-component';
import { useTwMerge } from '../../jotai/useTwMerge';
import { JotaiSpan } from '../../jotai/span';
import { JotaiDiv } from '../../jotai/div';
import { JotaiLabel } from '../../jotai/label';

export type FieldProps = React.ComponentProps<typeof JotaiLabel>;

export type FieldSlots = {
	Label: {
		className?: string | Atom<string>;
		children?: React.ReactNode;
	};
	Contents: {
		className?: string | Atom<string>;
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

		const classNameAtom = useTwMerge('group', className);
		const labelClassNameAtom = useTwMerge(
			'group-focus-within:font-bold transition-all pt-2',
			labelClassName,
		);
		const contentsClassNameAtom = useTwMerge(
			'block flex-grow md:flex-grow-0',
			contentsClassName,
		);

		return (
			<JotaiLabel className={classNameAtom} {...props}>
				<JotaiSpan className={labelClassNameAtom}>{labelChildren}</JotaiSpan>
				<JotaiDiv className={contentsClassNameAtom}>
					{contentsChildren}
				</JotaiDiv>
			</JotaiLabel>
		);
	},
);
Field.displayName = 'Field';
