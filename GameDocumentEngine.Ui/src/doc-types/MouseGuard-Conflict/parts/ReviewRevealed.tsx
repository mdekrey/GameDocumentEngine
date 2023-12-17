import type { ActionChoice, SideState } from '../conflict-types';
import type { FormFieldReturnType } from '@/utils/form';
import { displayChoice } from './CardSelect';
import { ButtonRow } from '@/components/button/button-row';
import { Button } from '@/components/button/button';
import { useFormFields } from '@/utils/form';
import { useAtomValue } from 'jotai';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useLaunchModal } from '@/utils/modal/modal-service';
import { useTranslation } from 'react-i18next';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import { Prose } from '@/components/text/common';
import type { TFunction } from 'i18next';
import { useDocTypeTranslation } from '@/utils/api/hooks';

export function ReviewRevealed({
	yourSide,
	yourSideRevealed,
	otherSideRevealed,
}: {
	yourSide: null | FormFieldReturnType<SideState>;
	yourSideRevealed: undefined | ActionChoice[];
	otherSideRevealed: undefined | ActionChoice[];
}) {
	const translation = useDocTypeTranslation('MouseGuard-Conflict');
	return (
		<section className="flex flex-col gap-4">
			<table className="grid grid-rows-3 md:grid-rows-none grid-flow-col md:grid-cols-3 md:grid-flow-row auto-rows-min auto-cols-fr justify-items-center items-center justify-center gap-4">
				<thead className="contents">
					<tr className="contents">
						<th>{translation('general.choice', { index: 1 })}</th>
						<th>{translation('general.choice', { index: 2 })}</th>
						<th>{translation('general.choice', { index: 3 })}</th>
					</tr>
				</thead>
				<tbody className="contents">
					<tr className="contents">
						{yourSideRevealed?.map((choice, index) => (
							<td key={index}>{displayChoice(choice, translation)}</td>
						))}
					</tr>
					<tr className="contents">
						{otherSideRevealed?.map((choice, index) => (
							<td key={index}>{displayChoice(choice, translation)}</td>
						))}
					</tr>
				</tbody>
			</table>
			{yourSide && (
				<ClearButtonRow yourSide={yourSide} translation={translation} />
			)}
		</section>
	);
}

function ClearButtonRow({
	yourSide,
	translation,
}: {
	yourSide: FormFieldReturnType<SideState>;
	translation: TFunction;
}) {
	const field = useFormFields(yourSide, {
		ready: ['ready'],
	});
	const launchModal = useLaunchModal();

	return (
		<ButtonRow>
			<Button
				disabled={useAtomValue(field.ready.readOnly)}
				onClick={() => void confirmClear()}
			>
				{translation('general.clear')}
			</Button>
		</ButtonRow>
	);

	async function confirmClear() {
		const shouldClear = await launchModal({
			ModalContents: ClearChoicesModal,
		}).catch(() => false);
		if (shouldClear) {
			yourSide.onChange((side) => ({
				...side,
				choices: [],
				ready: false,
				revealed: undefined,
			}));
		}
	}
}

export function ClearChoicesModal({
	resolve,
	reject,
}: ModalContentsProps<boolean>) {
	const { t } = useTranslation('doc-types:MouseGuard-Conflict', {
		keyPrefix: 'clear-modal',
	});

	return (
		<ModalAlertLayout>
			<ModalAlertLayout.Title>{t('title')}</ModalAlertLayout.Title>
			<Prose>{t('are-you-sure')}</Prose>
			<ModalAlertLayout.Buttons>
				<Button onClick={onSubmit}>{t('submit')}</Button>
				<Button.Secondary onClick={() => reject('Cancel')}>
					{t('cancel')}
				</Button.Secondary>
			</ModalAlertLayout.Buttons>
		</ModalAlertLayout>
	);

	function onSubmit() {
		resolve(true);
	}
}
