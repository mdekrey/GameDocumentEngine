import type { Atom } from 'jotai';
import { withSlots } from 'react-slot-component';
import { useTwMerge } from '../../jotai/useTwMerge';
import { JotaiSpan } from '../../jotai/span';
import { JotaiDiv } from '../../jotai/div';
import { JotaiLabel } from '../../jotai/label';
import { elementTemplate } from '@/components/template';

export type FieldProps = React.ComponentProps<typeof JotaiLabel> & {
	noLabel?: boolean;
};

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
	({ noLabel, className, slotProps, ...props }) => {
		const { className: labelClassName, children: labelChildren } =
			slotProps.Label ?? {};
		if (!labelChildren) throw new Error('No label provided for field');
		const { className: contentsClassName, children: contentsChildren } =
			slotProps.Contents ?? {};

		const classNameAtom = useTwMerge('group', className);
		const labelClassNameAtom = useTwMerge(
			'group-focus-within:font-bold text-sm transition-all pt-2',
			labelClassName,
		);
		const contentsClassNameAtom = useTwMerge('block', contentsClassName);

		const Container = noLabel ? JotaiSpan : JotaiLabel;

		return (
			<Container className={classNameAtom} {...props}>
				<JotaiSpan className={labelClassNameAtom}>{labelChildren}</JotaiSpan>
				<JotaiDiv className={contentsClassNameAtom}>
					{contentsChildren}
				</JotaiDiv>
			</Container>
		);
	},
);
Field.displayName = 'Field';
