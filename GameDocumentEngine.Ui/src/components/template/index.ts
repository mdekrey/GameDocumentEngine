import React, { createElement, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type ElementTemplate<TType extends keyof JSX.IntrinsicElements> = React.FC<
	JSX.IntrinsicElements[TType]
> & {
	extend: (
		name: string,
		elem: React.ReactElement<JSX.IntrinsicElements[TType], TType>,
	) => ElementTemplate<TType>;
};
export function template<TType extends keyof JSX.IntrinsicElements>(
	name: string,
	elem: JSX.Element,
): ElementTemplate<TType> {
	const {
		type,
		props: { className: defaultClassName, ...defaultProps },
	} = elem;
	const base = forwardRef(
		({ children, className, ...props }: JSX.IntrinsicElements[TType], ref) =>
			createElement(
				type as TType,
				{
					...defaultProps,
					...props,
					className: twMerge(defaultClassName as string, className),
					ref,
				},
				children,
			),
	) as unknown as React.FC<JSX.IntrinsicElements[TType]>;
	return Object.assign(base, {
		displayName: name,
		extend(
			name: string,
			{
				props: { className, ...props },
			}: React.ReactElement<JSX.IntrinsicElements[TType], TType>,
		) {
			return template<TType>(
				name,
				createElement(type, {
					...defaultProps,
					...props,
					className: twMerge(defaultClassName as string, className),
				}),
			);
		},
	});
}
