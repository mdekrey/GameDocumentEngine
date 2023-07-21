import { Button } from '@/components/button/button';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import { ModalContentsProps } from '@/utils/modal/modal-service';

export function DeleteInviteModal({
	resolve,
	reject,
	additional: { url },
}: ModalContentsProps<boolean, { url: string }>) {
	return (
		<ModalAlertLayout>
			<ModalAlertLayout.Title>Delete invite</ModalAlertLayout.Title>
			<p className="text-sm text-gray-500">
				Are you sure you want to delete the invite with the url{' '}
				<span className="font-mono text-blue-950">{url}</span>? This action
				cannot be undone.
			</p>
			<ModalAlertLayout.Buttons>
				<Button.Destructive onClick={() => resolve(true)}>
					Delete
				</Button.Destructive>
				<Button.Secondary onClick={() => reject('Cancel')}>
					Cancel
				</Button.Secondary>
			</ModalAlertLayout.Buttons>
		</ModalAlertLayout>
	);
}
