import type { RichTextData } from './type';
import type { StandardField } from '@/components/form-fields/FieldProps';
import { DisplayRichText } from './DisplayRichText';
import { Field } from '@/components/form-fields/field/field';
import { IconButton } from '@/components/button/icon-button';
import { HiPencil } from 'react-icons/hi2';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useLaunchModal } from '@/utils/modal/modal-service';
import { useRef } from 'react';
import { EditorJSComponent } from './EditorJSComponent';
import type EditorJS from '@editorjs/editorjs';
import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import { Button } from '@/components/button/button';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { Section } from '@/components/sections';
import { useAtomValue } from 'jotai';
import type { OutputBlockData } from '@editorjs/editorjs';
import { Trans, useTranslation } from 'react-i18next';

export function RichTextField({
	className,
	field,
}: {
	className?: string;
	field: StandardField<RichTextData | undefined>;
}) {
	const isDisabled = useAtomValue(field.disabled);
	const isReadOnly = useAtomValue(field.readOnly);
	const launchModal = useLaunchModal();
	return (
		<Field className={className}>
			<Field.Label>
				{isDisabled || isReadOnly ? null : (
					<IconButton onClick={() => void launchEdit()} className="float-right">
						<HiPencil />
					</IconButton>
				)}
				{field.translation('label')}
			</Field.Label>
			<Field.Contents className="border border-slate-500 px-2 mt-2">
				<DisplayRichText data={field.value} className={className} />
			</Field.Contents>
		</Field>
	);

	async function launchEdit() {
		const newData = await launchModal({
			ModalContents: EditorJSModal,
			additional: {
				field,
			},
		});
		field.onChange(newData);
	}
}

function EditorJSModal({
	resolve,
	reject,
	additional: { field },
}: ModalContentsProps<
	RichTextData,
	{
		field:
			| StandardField<RichTextData>
			| StandardField<RichTextData | undefined>;
	}
>) {
	const { t } = useTranslation('rich-text-editor', { keyPrefix: 'modal' });
	const initialValue = useRef(field.getValue());
	const editorJsRef = useRef<EditorJS>();

	return (
		<form onSubmit={(ev) => void onSubmit(ev)}>
			<ModalDialogLayout>
				<ModalDialogLayout.Title>
					<Trans
						i18nKey="title"
						t={t}
						values={{ target: field.translation('label') }}
					/>
				</ModalDialogLayout.Title>
				<Fieldset>
					<Section>
						<EditorJSComponent
							editorRef={editorJsRef}
							data={initialValue.current}
							autofocus={true}
						/>
					</Section>
				</Fieldset>
				<ModalDialogLayout.Buttons>
					<Button type="submit">{t('submit')}</Button>
					<Button.DestructiveSecondary onClick={() => reject('Cancel')}>
						{t('cancel')}
					</Button.DestructiveSecondary>
				</ModalDialogLayout.Buttons>
			</ModalDialogLayout>
		</form>
	);

	async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
		ev.preventDefault();
		if (!editorJsRef.current) return;
		await editorJsRef.current.isReady;
		const outputData = await editorJsRef.current.save();
		if (verifyValidBlocks(outputData.blocks))
			resolve({ blocks: outputData.blocks });
		else throw new Error('Could not save editor; not all blocks have an id');
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EditorBlocks = OutputBlockData<string, any>[];
function verifyValidBlocks(
	blocks: EditorBlocks,
): blocks is RichTextData['blocks'] {
	return !blocks.some((block) => !block.id);
}
