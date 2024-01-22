import {
	BlockTypeSelect,
	BoldItalicUnderlineToggles,
	ChangeCodeMirrorLanguage,
	CodeToggle,
	ConditionalContents,
	CreateLink,
	DiffSourceToggleWrapper,
	InsertTable,
	InsertThematicBreak,
	ListsToggle,
	Separator,
	UndoRedo,
} from '@mdxeditor/editor';

export const Toolbar = () => (
	<DiffSourceToggleWrapper>
		<ConditionalContents
			options={[
				{
					when: (editor) => editor?.editorType === 'codeblock',
					contents: () => <ChangeCodeMirrorLanguage />,
				},
				{
					fallback: () => (
						<>
							<UndoRedo />
							<Separator />
							<BoldItalicUnderlineToggles />
							<CodeToggle />
							<Separator />
							<ListsToggle />
							<Separator />

							<ConditionalContents
								options={[{ fallback: () => <BlockTypeSelect /> }]}
							/>

							<Separator />

							<CreateLink />
							{/* <InsertImage /> */}

							<Separator />

							<InsertTable />
							<InsertThematicBreak />
						</>
					),
				},
			]}
		/>
	</DiffSourceToggleWrapper>
);
