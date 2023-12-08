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
	/**
	 * Allows mutation of properties before passing to element.
	 *
	 * @param props The end-user's properties (or as passed in by a subsequent template)
	 * @returns The properties passed to the underlying component
	 **/
	mutateProps?: (props: PropsOf<TType>) => PropsOf<TType>;
};

export type TemplateResolver<TType extends AllowedTypes = AllowedTypes> = (
	this: void,
	template: PartialElement<TType>,
) => React.ReactElement;

export type ThemedTemplateResolver<
	TKeys extends string,
	TType extends AllowedTypes = AllowedTypes,
> = Record<TKeys, TemplateResolver<TType>>;

/** Captures types of a theme without needing to explicitly type. */
export function buildTheme<
	TKeys extends string,
	TType extends AllowedTypes = AllowedTypes,
>(theme: ThemedTemplateResolver<TKeys, TType>) {
	return theme;
}

export type TemplatedComponentOf<TType extends AllowedTypes> = React.FC<
	PropsOf<TType>
>;
export interface ElementTemplate<TType extends AllowedTypes>
	extends TemplatedComponentOf<TType> {
	/** The display name of the template to React dev tools */
	displayName: string;

	/** Extends an element template to a new component that can be further extended */
	extend: (
		name: string,
		elem: TemplateResolver<TType>,
		options?: ExtendOptions<TType> | undefined,
	) => ElementTemplate<TType>;

	/**
	 * Applies a number of themes that can be accessed on the result along with
	 * the original template.
	 *
	 * @param themes A map of themes to Template resolvers. Each key becomes a
	 * new component, such that if `Button.themed({ Blue: ... })` is called,
	 * `Button.Blue` may be used.
	 **/
	themed<TKeys extends string>(
		this: ElementTemplate<TType>,
		themes: Record<TKeys, TemplateResolver<TType>>,
	): this & Record<TKeys, ElementTemplate<TType>>;
}

type ExtendParams<TType extends AllowedTypes> = Parameters<
	ElementTemplate<TType>['extend']
>;

/**
 * Creates a new React component from a given template, allowing further
 * extensions and theming. This accounts for using `tailwind-merge` to merge
 * classes together (latest-wins) and style elements together (also
 * latest-wins). Also includes forwardRef into components that support it.
 *
 * @param name Display name of the component in React Dev Tools
 * @param originalType The original component to wrap. May be either an
 * intrinsic element such as 'div' or 'button' or another React component.
 * @param templateResolver The template function with default fields. A
 * component type is passed in to support the original component. If another
 * component is used, the new component type will be used.
 * @param options Optional. @see ExtendOptions for more details on each
 * property.
 **/
export function elementTemplate<TType extends AllowedTypes>(
	name: string,
	originalType: TType,
	templateResolver: TemplateResolver<TType>,
	options: ExtendOptions<TType> | undefined = {},
): ElementTemplate<TType> {
	const {
		type,
		props: {
			className: defaultClassName,
			style: defaultStyle,
			...defaultProps
		},
	} = templateResolver(originalType as PartialElement<TType>);
	const mutateProps = options?.mutateProps ?? identity;
	const base = forwardRef(
		({ children, className, style, ...props }: PropsOf<TType>, ref) =>
			createElement(
				type,
				mutateProps({
					...defaultProps,
					...props,
					className: twMerge(defaultClassName as string, className as string),
					style: { ...defaultStyle, ...style },
					ref,
				} as PropsOf<TType>),
				children as React.ReactNode,
			),
	) as unknown as React.FC<PropsOf<TType>>;
	return Object.assign(base, {
		displayName: name,
		extend(
			...[name, templateResolver, extendedOptions = {}]: ExtendParams<TType>
		) {
			const {
				type: myType,
				props: { className, style, ...props },
			} = templateResolver(type as PartialElement<TType>);
			return elementTemplate<TType>(
				name,
				myType as TType,
				(T) =>
					createElement(T, {
						...defaultProps,
						...props,
						className: twMerge(defaultClassName as string, className as string),
						style: { ...defaultStyle, ...style },
					} as PropsOf<TType>),
				{
					mutateProps: (orig) =>
						// eslint-disable-next-line @typescript-eslint/no-unsafe-return
						mutateProps(extendedOptions?.mutateProps?.(orig) ?? orig),
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
