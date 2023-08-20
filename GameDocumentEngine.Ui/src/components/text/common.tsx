import React, { createElement, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

function textElem<TType extends keyof JSX.IntrinsicElements>(
	name: string,
	elementType: TType,
	defaultClassName: string,
) {
	const result = forwardRef(
		({ children, className, ...props }: JSX.IntrinsicElements[TType], ref) =>
			createElement(
				elementType,
				{ ...props, className: twMerge(defaultClassName, className), ref },
				children,
			),
	) as unknown as React.FC<JSX.IntrinsicElements[TType]>;
	result.displayName = name;
	return result;
}

export const Prose = textElem(
	'Prose',
	'p',
	'text-sm text-slate-700 dark:text-slate-300',
);
