export type RichTextBlockData = {
	id: string;
	type: string;
	data: object;
};

export type RichTextData = {
	blocks: RichTextBlockData[];
};
