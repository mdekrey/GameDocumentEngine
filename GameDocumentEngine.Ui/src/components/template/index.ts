/* eslint-disable @typescript-eslint/no-unsafe-return */
// TODO: Not sure why there's an unsafe return...
import React, { createElement, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type AllowedTypes =
	| keyof JSX.IntrinsicElements
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| React.JSXElementConstructor<any>;
type PropsOf<TType extends AllowedTypes> =
	TType extends keyof JSX.IntrinsicElements
		? JSX.IntrinsicElements[TType]
		: React.ComponentProps<TType>;

type ReactElementOfType<TType extends AllowedTypes> = React.ReactElement<
	PropsOf<TType>,
	TType
>;

export type ExtendOptions<TType extends AllowedTypes> = {
	mutateProps?: (props: PropsOf<TType>) => PropsOf<TType>;
};

type ExtendParams<TType extends AllowedTypes> = [
	name: string,
	elem: ReactElementOfType<TType>,
	options?: ExtendOptions<TType> | undefined,
];

export interface ElementTemplate<TType extends AllowedTypes>
	extends React.FC<PropsOf<TType>> {
	displayName: string;
	extend: (...params: ExtendParams<TType>) => ElementTemplate<TType>;
	themed<TKeys extends string>(
		this: ElementTemplate<TType>,
		themes: Record<TKeys, JSX.Element>,
	): this & Record<TKeys, ElementTemplate<TType>>;
}
export function elementTemplate<TType extends AllowedTypes>(
	...[
		name,
		{
			type,
			props: { className: defaultClassName, ...defaultProps },
		},
		options = {},
	]: ExtendParams<TType>
): ElementTemplate<TType> {
	const mutateProps = options?.mutateProps ?? ((orig) => orig);
	const base = forwardRef(
		({ children, className, ...props }: PropsOf<TType>, ref) =>
			createElement(
				type,
				mutateProps({
					...defaultProps,
					...props,
					className: twMerge(defaultClassName as string, className as string),
					ref,
				} as PropsOf<TType>),
				children as React.ReactNode,
			),
	) as unknown as React.FC<PropsOf<TType>>;
	return Object.assign(base, {
		displayName: name,
		extend(
			...[
				name,
				{
					props: { className, ...props },
				},
				options = {},
			]: ExtendParams<TType>
		) {
			return elementTemplate<TType>(
				name,
				createElement(type, {
					...defaultProps,
					...props,
					className: twMerge(defaultClassName as string, className as string),
				}) as ReactElementOfType<TType>,
				{
					mutateProps: (orig) =>
						mutateProps(options?.mutateProps?.(orig) ?? orig),
				},
			);
		},
		themed<TKeys extends string>(
			this: ElementTemplate<TType>,
			themes: Record<TKeys, JSX.Element>,
		) {
			const result = Object.assign(
				this,
				Object.fromEntries(
					Object.entries<JSX.Element>(themes).map(
						([name, example]) =>
							[
								name as TKeys,
								this.extend(`${this.displayName}.${name}`, example),
							] as const,
					),
				) as Record<TKeys, ElementTemplate<TType>>,
			);
			return result;
		},
	});
}
