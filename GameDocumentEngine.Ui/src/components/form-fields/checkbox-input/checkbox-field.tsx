import type { Atom } from 'jotai';
import { withSlots } from 'react-slot-component';
import { useTwMerge } from '../../jotai/useTwMerge';
import { CheckboxInput } from './checkbox-input';
import type { FieldProps } from '../FieldProps';
import { JotaiLabel } from '../../jotai/label';
import { JotaiDiv } from '../../jotai/div';
import type { FieldMapping } from '@/utils/form';
import { ErrorsList } from '../errors/errors-list';

export const undefinedAsFalseMapping: FieldMapping<
	boolean | undefined,
	boolean
> = {
	toForm: (v: boolean | undefined) => v || false,
	fromForm: (v) => v || undefined,
};

export type CheckboxFieldProps = FieldProps<boolean> & {
	readOnly?: boolean;
	className?: string | Atom<string>;
};

export type CheckboxFieldSlots = {
	ErrorsContainer: {
		className?: string | Atom<string>;
	};
};

export const CheckboxField = withSlots<CheckboxFieldSlots, CheckboxFieldProps>(
	({ slotProps, field, className, readOnly }) => {
		const { className: errorsContainerClassName } =
			slotProps.ErrorsContainer ?? {};

		const classNameAtom = useTwMerge('md:py-2', className);
		const contentsClassNameAtom = useTwMerge(
			'block flex-grow md:flex-grow-0',
			errorsContainerClassName,
		);

		return (
			<>
				<JotaiLabel className={classNameAtom}>
					<CheckboxInput
						{...field.htmlProps.asCheckbox()}
						readOnly={readOnly}
					/>{' '}
					{field.translation('label')}
					<JotaiDiv className={contentsClassNameAtom}>
						<ErrorsList
							errors={field.errors}
							translations={field.translation}
						/>
					</JotaiDiv>
				</JotaiLabel>
			</>
		);
	},
);
CheckboxField.displayName = 'CheckboxField';
