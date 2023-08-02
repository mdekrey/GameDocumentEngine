import { Atom } from 'jotai';
import { withSlots } from 'react-slot-component';
import { useTwMerge } from '../jotai/useTwMerge';
import { CheckboxInput } from './checkbox-input';
import { FieldProps } from '../FieldProps';
import { JotaiLabel } from '../jotai/label';
import { JotaiDiv } from '../jotai/div';
import { FieldMapping } from '@/utils/form/useField';
import { ErrorsList } from '../jotai/errors/errors-list';

export const undefinedAsFalseMapping: FieldMapping<
	boolean | undefined,
	boolean
> = {
	toForm: (v: boolean | undefined) => v || false,
	fromForm: (v) => v || undefined,
};

export type CheckboxFieldProps = FieldProps<boolean> & {
	className?: string | Atom<string>;
};

export type CheckboxFieldSlots = {
	ErrorsContainer: {
		className?: string | Atom<string>;
	};
};

export const CheckboxField = withSlots<CheckboxFieldSlots, CheckboxFieldProps>(
	({ slotProps, field, className }) => {
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
					<CheckboxInput {...field.htmlProps.asCheckbox()} />{' '}
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
