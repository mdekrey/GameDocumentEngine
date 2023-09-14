import '@/utils/api/queries';
import type { GameObjectWidgetProps, Updater } from '../defineDocument';
import { ClockSvg } from './clock-svg';
import { IconButton } from '@/components/button/icon-button';
import { HiOutlinePencil } from 'react-icons/hi2';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useModal } from '@/utils/modal/modal-service';
import { ClockEdit } from './clock-edit';
import type { Clock, ClockDocument } from './clock-types';
import { useQuery } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import { useMemo } from 'react';
import { Section, SingleColumnSections } from '@/components/sections';

export function Clock({
	document,
	onUpdateDocument,
	translation: t,
}: GameObjectWidgetProps<Clock>) {
	const fixupClockData = useMemo(
		(): ClockDocument | null =>
			document.isSuccess
				? {
						name: document.data.name,
						details: document.data.details,
				  }
				: null,
		[document.isSuccess, document.data],
	);

	const launchModal = useModal();
	if (!document.data || !fixupClockData) {
		return 'Loading...';
	}

	const clockData = document.data;

	return (
		<SingleColumnSections>
			<Section>
				<div className="flex flex-row gap-3">
					<span className="font-bold flex-1">{document.data.name}</span>
					<IconButton title={t('details.edit')} onClick={onEdit}>
						<HiOutlinePencil />
					</IconButton>
				</div>
				<ClockSvg
					className="self-center mx-auto"
					currentTicks={document.data.details.current}
					totalTicks={document.data.details.max}
					padding={2}
					radius={70}
				/>
			</Section>
			<Section>
				<ClockEdit
					clock={fixupClockData}
					onUpdateClock={(updater) => onUpdateDocument(updater)}
				/>
			</Section>
		</SingleColumnSections>
	);

	function onEdit() {
		void launchModal({
			additional: {
				gameId: clockData.gameId,
				documentId: clockData.id,
				onUpdateClock: onUpdateDocument,
			},
			ModalContents: EditModal,
		});
	}
}

function EditModal({
	resolve,
	additional: { gameId, documentId, onUpdateClock },
}: ModalContentsProps<
	boolean,
	{
		gameId: string;
		documentId: string;
		onUpdateClock: Updater<Clock>;
	}
>) {
	const documentQuery = useQuery(queries.getDocument(gameId, documentId));

	const clockData = useMemo(
		(): ClockDocument | null =>
			documentQuery.isSuccess
				? {
						name: documentQuery.data.name,
						details: documentQuery.data.details as ClockDocument['details'],
				  }
				: null,
		[documentQuery.isSuccess, documentQuery.data],
	);
	if (!clockData) {
		return 'Loading...';
	}

	return (
		<ClockEdit
			clock={clockData}
			onUpdateClock={async (updater) => {
				await onUpdateClock(updater);
				resolve(false);
			}}
		/>
	);
}
