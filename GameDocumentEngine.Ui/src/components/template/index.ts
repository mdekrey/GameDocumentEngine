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

type PartialElement<TProps> = React.JSXElementConstructor<Partial<TProps>>;

const identity = <T>(orig: T) => orig;

type BaseMapPropsOptions<TProps, TNewProps> = {
	/**
	 * Allows mutation of properties before passing to element.
	 *
	 * @param props The end-user's properties (or as passed in by a subsequent template)
	 * @returns The properties passed to the underlying component
	 **/
	useProps(this: void, props: TNewProps): TProps;
};

type MapPropsOptions<TProps, TNewProps> = TProps extends TNewProps
	? TNewProps extends TProps
		? Partial<BaseMapPropsOptions<TProps, TNewProps>>
		: BaseMapPropsOptions<TProps, TNewProps>
	: BaseMapPropsOptions<TProps, TNewProps>;

export type ExtendOptions<TProps, TNewProps = TProps> = MapPropsOptions<
	TProps,
	TNewProps
> & {
	// placeholder for more options
};

export type TemplateResolver<TProps> = (
	this: void,
	template: PartialElement<TProps>,
) => React.ReactElement;

export type ThemedTemplateResolver<TKeys extends string, TProps> = Record<
	TKeys,
	TemplateResolver<TProps>
>;

/** Captures types of a theme without needing to explicitly type. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildTheme<TKeys extends string, TProps = any>(
	theme: ThemedTemplateResolver<TKeys, TProps>,
) {
	return theme;
}

export interface ElementTemplate<TProps> {
	(props: TProps): React.ReactNode;

	/** The display name of the template to React dev tools */
	displayName: string;

	/** Extends an element template to a new component that can be further extended */
	extend<TNewProps = TProps>(
		name: string,
		elem: TemplateResolver<TProps>,
		options?: ExtendOptions<TProps, TNewProps> | undefined,
	): ElementTemplate<TNewProps>;

	/**
	 * Applies a number of themes that can be accessed on the result along with
	 * the original template.
	 *
	 * @param themes A map of themes to Template resolvers. Each key becomes a
	 * new component, such that if `Button.themed({ Blue: ... })` is called,
	 * `Button.Blue` may be used.
	 **/
	themed<TKeys extends string>(
		this: ElementTemplate<TProps>,
		themes: Record<TKeys, TemplateResolver<TProps>>,
	): this & Record<TKeys, ElementTemplate<TProps>>;
}

export function elementTemplate<TType extends AllowedTypes>(
	name: string,
	originalType: TType,
	templateResolver: TemplateResolver<PropsOf<TType>>,
	options?: ExtendOptions<PropsOf<TType>, PropsOf<TType>>,
): ElementTemplate<PropsOf<TType>>;
export function elementTemplate<
	TType extends AllowedTypes,
	TBaseProps = PropsOf<TType>,
>(
	name: string,
	originalType: TType,
	templateResolver: TemplateResolver<PropsOf<TType>>,
	options: ExtendOptions<PropsOf<TType>, TBaseProps>,
): ElementTemplate<TBaseProps>;
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
export function elementTemplate<
	TType extends AllowedTypes,
	TBaseProps = PropsOf<TType>,
>(
	name: string,
	originalType: TType,
	templateResolver: TemplateResolver<PropsOf<TType>>,
	options: Partial<ExtendOptions<PropsOf<TType>, TBaseProps>> = {},
): ElementTemplate<TBaseProps> {
	type TProps = PropsOf<TType>;
	const {
		type,
		props: {
			className: defaultClassName,
			style: defaultStyle,
			...defaultProps
		},
	} = templateResolver(originalType as PartialElement<TProps>);
	const useProps: (props: TBaseProps) => TProps = options?.useProps ?? identity;
	const base = forwardRef(
		({ children, className, style, ...props }: TProps, ref) =>
			createElement(
				type,
				useProps({
					...defaultProps,
					...props,
					className: twMerge(defaultClassName as string, className as string),
					style: { ...defaultStyle, ...style },
					ref,
				} as TProps),
				children as React.ReactNode,
			),
	) as React.FC<TBaseProps>;
	return Object.assign(base, {
		displayName: name,
		extend: <TNewProps>(
			name: string,
			templateResolver: TemplateResolver<TBaseProps>,
			extendedOptions?: ExtendOptions<TBaseProps, TNewProps> | undefined,
		): ElementTemplate<TNewProps> => {
			const {
				type: myType,
				props: { className, style, ...props },
			} = templateResolver(type as PartialElement<TBaseProps>);
			const useNewProps =
				extendedOptions?.useProps ??
				(identity as (props: TNewProps) => TBaseProps);
			return elementTemplate<TType, TNewProps>(
				name,
				myType as TType,
				(T) =>
					createElement(T, {
						...defaultProps,
						...props,
						className: twMerge(defaultClassName as string, className as string),
						style: { ...defaultStyle, ...style },
					} as TProps),
				{
					useProps: (orig) =>
						// eslint-disable-next-line @typescript-eslint/no-unsafe-return
						useProps(useNewProps(orig)),
				} as MapPropsOptions<TProps, TNewProps>,
			);
		},
		themed<TKeys extends string>(
			this: ElementTemplate<TBaseProps>,
			themes: Record<TKeys, TemplateResolver<TBaseProps>>,
		): ElementTemplate<TBaseProps> &
			Record<TKeys, ElementTemplate<TBaseProps>> {
			const result = Object.assign(
				this,
				Object.fromEntries(
					Object.entries<TemplateResolver<TBaseProps>>(themes).map(
						([name, example]) =>
							[
								name as TKeys,
								this.extend(`${this.displayName}.${name}`, example),
							] as const,
					),
				) as Record<TKeys, ElementTemplate<TBaseProps>>,
			);
			return result;
		},
	});
}
