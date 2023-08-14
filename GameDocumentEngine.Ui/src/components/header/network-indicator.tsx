import { twMerge } from 'tailwind-merge';
import { HiSignalSlash, HiSignal } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import { useRealtimeApi } from '@/utils/api/realtime-api';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { HubConnectionState } from '@microsoft/signalr';
import { JotaiDiv } from '@/components/form-fields/jotai/div';
import { IconButton } from '../button/icon-button';
import { ModalContentsProps, useModal } from '@/utils/modal/modal-service';
import { useRef, useEffect, useCallback } from 'react';
import { useStore } from 'jotai';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import { Button } from '../button/button';
import { ModalAlertIcon } from '@/utils/modal/alert-icon';

export function NetworkIndicator() {
	const { t } = useTranslation(['network']);
	const abortModal = useRef<AbortController | null>(null);
	const launchModal = useModal();
	const store = useStore();
	const realtimeApi = useRealtimeApi();
	const disconnectedClass = useComputedAtom<string>((get) =>
		twMerge(
			'ml-auto',
			get(realtimeApi.connectionState$) === HubConnectionState.Connected
				? 'hidden'
				: 'contents',
		),
	);
	const onReconnect = useCallback(
		function onReconnect() {
			abortModal.current?.abort();
			abortModal.current = new AbortController();
			void realtimeApi.reconnect().then(() => abortModal.current?.abort());
			void launchModal({
				ModalContents: ReconnectingModal,
				abort: abortModal.current.signal,
			});
		},
		[launchModal, realtimeApi],
	);
	useEffect(() => {
		return store.sub(realtimeApi.connectionState$, () => {
			const state = store.get(realtimeApi.connectionState$);
			if (state === HubConnectionState.Disconnected) {
				abortModal.current?.abort();
				abortModal.current = new AbortController();

				void launchModal({
					ModalContents: DisconnectedModal,
					additional: { onReconnect },
					abort: abortModal.current.signal,
				});
			}
		});
	}, [store, realtimeApi.connectionState$, launchModal, onReconnect]);

	return (
		<JotaiDiv className={disconnectedClass}>
			<IconButton.DestructiveSecondary
				onClick={onReconnect}
				title={t('signal-disconnected')}
			>
				<HiSignalSlash />
			</IconButton.DestructiveSecondary>
		</JotaiDiv>
	);
}

function ReconnectingModal({ reject }: ModalContentsProps<void>) {
	const { t } = useTranslation(['network'], { keyPrefix: 'reconnecting' });
	return (
		<ModalAlertLayout>
			<ModalAlertLayout.Title>{t('title')}</ModalAlertLayout.Title>
			<ModalAlertLayout.Icon>
				<ModalAlertIcon icon={HiSignal} />
			</ModalAlertLayout.Icon>
			<p className="text-sm text-gray-500">{t('reconnecting-notice')}</p>
			<ModalAlertLayout.Buttons>
				<Button.Secondary onClick={() => reject('Dismissed')}>
					{t('dismiss')}
				</Button.Secondary>
			</ModalAlertLayout.Buttons>
		</ModalAlertLayout>
	);
}

function DisconnectedModal({
	reject,
	additional: { onReconnect },
}: ModalContentsProps<void, { onReconnect: () => void }>) {
	const { t } = useTranslation(['network'], { keyPrefix: 'disconnected' });
	return (
		<ModalAlertLayout>
			<ModalAlertLayout.Title>{t('title')}</ModalAlertLayout.Title>
			<ModalAlertLayout.Icon>
				<ModalAlertIcon icon={HiSignalSlash} />
			</ModalAlertLayout.Icon>
			<p className="text-sm text-gray-500">{t('lost-connection-notice')}</p>
			<ModalAlertLayout.Buttons>
				<Button.Save onClick={onReconnect}>{t('reconnect')}</Button.Save>
				<Button.Secondary onClick={() => reject('Dismissed')}>
					{t('dismiss')}
				</Button.Secondary>
			</ModalAlertLayout.Buttons>
		</ModalAlertLayout>
	);
}
