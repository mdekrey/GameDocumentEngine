import { twMerge } from 'tailwind-merge';
import { HiSignalSlash } from 'react-icons/hi2';
import { useTranslation } from 'react-i18next';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { HubConnectionState } from '@microsoft/signalr';
import { JotaiDiv } from '@/components/jotai/div';
import { IconButton } from '../button/icon-button';
import { useModal } from '@/utils/modal/modal-service';
import { useRef, useEffect, useCallback, memo } from 'react';
import type { Atom} from 'jotai';
import { useStore } from 'jotai';
import { DisconnectedModal } from './modal/disconnected';
import { ReconnectingModal } from './modal/reconnecting';

export type NetworkIndicatorProps = {
	connectionState: Atom<HubConnectionState>;
	onReconnect: () => Promise<void>;
};

export const NetworkIndicator = memo(function NetworkIndicator({
	connectionState,
	onReconnect: reconnect,
}: NetworkIndicatorProps) {
	const abortModal = useRef<AbortController | null>(null);
	const launchModal = useModal();
	const store = useStore();
	const onReconnect = useCallback(
		function onReconnect() {
			abortModal.current?.abort();
			abortModal.current = new AbortController();
			void reconnect().then(() => abortModal.current?.abort());
			void launchModal({
				ModalContents: ReconnectingModal,
				abort: abortModal.current.signal,
			});
		},
		[launchModal, reconnect],
	);
	useEffect(() => {
		return store.sub(connectionState, () => {
			const state = store.get(connectionState);
			if (state === HubConnectionState.Disconnected) {
				abortModal.current?.abort();
				abortModal.current = new AbortController();

				void launchModal({
					ModalContents: DisconnectedModal,
					additional: { onReconnect },
					abort: abortModal.current.signal,
				});
			} else if (state === HubConnectionState.Connected) {
				abortModal.current?.abort();
			}
		});
	}, [store, connectionState, launchModal, onReconnect]);

	const { t } = useTranslation(['network']);
	const disconnectedClass = useComputedAtom<string>((get) =>
		twMerge(
			'ml-auto',
			get(connectionState) === HubConnectionState.Connected
				? 'hidden'
				: 'contents',
		),
	);

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
});
