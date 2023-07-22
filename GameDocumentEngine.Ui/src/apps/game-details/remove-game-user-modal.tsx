import { Button } from '@/components/button/button';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import { ModalContentsProps } from '@/utils/modal/modal-service';

export function RemoveGameUserModal({
	resolve,
	reject,
	additional: { name: originalName },
}: ModalContentsProps<boolean, { name: string }>) {
	return (
		<ModalAlertLayout>
			<ModalAlertLayout.Title>Remove user</ModalAlertLayout.Title>
			<p className="text-sm text-gray-500">
				Are you sure you want to remove{' '}
				<span className="font-bold">{originalName}</span> from the game? All of
				their permissions within this game will be removed.
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
