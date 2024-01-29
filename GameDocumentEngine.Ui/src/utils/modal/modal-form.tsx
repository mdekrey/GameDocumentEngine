import type { TFunction } from 'i18next';
import React from 'react';
import { ModalDialogLayout } from './modal-dialog';
import { Button } from '@/components/button/button';

export function ModalForm({
	children,
	title,
	translation: t,
	additionalButtons,
	onSubmit,
	onCancel,
}: {
	children?: React.ReactNode;
	title?: React.ReactNode;
	onSubmit?: React.FormEventHandler<HTMLFormElement>;
	onCancel?: () => void;
	translation: TFunction;
	additionalButtons?: React.ReactNode;
}) {
	return (
		<form onSubmit={onSubmit}>
			<ModalDialogLayout>
				<ModalDialogLayout.Title>{title ?? t('title')}</ModalDialogLayout.Title>
				{children}
				<ModalDialogLayout.Buttons>
					<Button type="submit">{t('submit')}</Button>
					{additionalButtons}
					{onCancel ? (
						<Button.Secondary onClick={onCancel}>
							{t('cancel')}
						</Button.Secondary>
					) : null}
				</ModalDialogLayout.Buttons>
			</ModalDialogLayout>
		</form>
	);
}
