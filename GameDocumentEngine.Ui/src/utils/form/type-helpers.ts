export type IfTrueThenProp<
	T extends boolean | undefined,
	TProp,
> = T extends true
	? TProp
	: T extends false | undefined
	? object
	: Partial<TProp>;

export type IfTrueThenElse<
	T extends boolean | undefined,
	TIfTrue,
	TIfFalse,
> = T extends true
	? TIfTrue
	: T extends false | undefined
	? TIfFalse
	: TIfTrue | TIfFalse;
