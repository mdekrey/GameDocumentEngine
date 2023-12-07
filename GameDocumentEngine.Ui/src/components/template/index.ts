import type React from 'react';
import { createElement, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type AllowedTypes =
	| keyof JSX.IntrinsicElements
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	| React.JSXElementConstructor<any>;
type PropsOf<TType extends AllowedTypes> =
	TType extends keyof JSX.IntrinsicElements
		? JSX.IntrinsicElements[TType]
		: React.ComponentProps<TType>;

type PartialElement<TType extends AllowedTypes> = React.JSXElementConstructor<
	Partial<PropsOf<TType>>
>;

const identity = <T>(orig: T) => orig;

export type ExtendOptions<TType extends AllowedTypes> = {
	mutateProps?: (props: PropsOf<TType>) => PropsOf<TType>;
};

type TemplateResolver<TType extends AllowedTypes> = (
	this: void,
	template: PartialElement<TType>,
) => React.ReactElement;

type BaseParams<TType extends AllowedTypes> = [
	name: string,
	type: TType,
	elem: TemplateResolver<TType>,
	options?: ExtendOptions<TType> | undefined,
];

type ExtendParams<TType extends AllowedTypes> = [
	name: string,
	elem: TemplateResolver<TType>,
	options?: ExtendOptions<TType> | undefined,
];

export type ThemedTemplateResolver<
	TKeys extends string,
	TType extends AllowedTypes,
> = Record<TKeys, TemplateResolver<TType>>;

export function buildTheme<TKeys extends string, TType extends AllowedTypes>(
	theme: ThemedTemplateResolver<TKeys, TType>,
) {
	return theme;
}

export interface ElementTemplate<TType extends AllowedTypes>
	extends React.FC<PropsOf<TType>> {
	displayName: string;
	extend: (...params: ExtendParams<TType>) => ElementTemplate<TType>;
	themed<TKeys extends string>(
		this: ElementTemplate<TType>,
		themes: Record<TKeys, TemplateResolver<TType>>,
	): this & Record<TKeys, ElementTemplate<TType>>;
}
export function elementTemplate<TType extends AllowedTypes>(
	...[name, originalType, templateResolver, baseOptions = {}]: BaseParams<TType>
): ElementTemplate<TType> {
	const {
		type,
		props: { className: defaultClassName, ...defaultProps },
	} = templateResolver(originalType as PartialElement<TType>);
	const mutateProps = baseOptions?.mutateProps ?? identity;
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
		extend(...[name, templateResolver, options = {}]: ExtendParams<TType>) {
			const {
				type: myType,
				props: { className, ...props },
			} = templateResolver(type as PartialElement<TType>);
			return elementTemplate<TType>(
				name,
				myType as TType,
				(T) =>
					createElement(T, {
						...defaultProps,
						...props,
						className: twMerge(defaultClassName as string, className as string),
					} as PropsOf<TType>),
				{
					mutateProps: (orig) =>
						// eslint-disable-next-line @typescript-eslint/no-unsafe-return
						mutateProps(options?.mutateProps?.(orig) ?? orig),
				},
			);
		},
		themed<TKeys extends string>(
			this: ElementTemplate<TType>,
			themes: Record<TKeys, TemplateResolver<TType>>,
		) {
			const result = Object.assign(
				this,
				Object.fromEntries(
					Object.entries<TemplateResolver<TType>>(themes).map(
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
