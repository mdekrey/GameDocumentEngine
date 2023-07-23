import '@/utils/api/queries';
import type { GameObjectWidgetProps, Updater } from '../defineDocument';
import { ClockSvg } from './clock-svg';
import { NarrowContent } from '@/utils/containers/narrow-content';
import { IconButton } from '@/components/button/icon-button';
import {
	HiOutlineCog,
	HiOutlineTrash,
	HiOutlineUserGroup,
} from 'react-icons/hi2';
import { ModalContentsProps, useModal } from '@/utils/modal/modal-service';
import { ClockEdit } from './clock-edit';
import { Clock, ClockDocument } from './clock-types';
import { useQuery } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import { useMemo } from 'react';
import { IconLinkButton } from '@/components/button/icon-link-button';

export function Clock({
	document,
	onDeleteDocument,
	onUpdateDocument,
}: GameObjectWidgetProps<Clock>) {
	const launchModal = useModal();
	if (!document.data) {
		return <>Loading...</>;
	}

	const clockData = document.data;

	return (
		<NarrowContent>
			<div className="flex flex-row gap-3">
				<span className="font-bold flex-1">{document.data.name}</span>
				<IconLinkButton to="roles">
					<HiOutlineUserGroup />
				</IconLinkButton>
				<IconButton onClick={onEdit}>
					<HiOutlineCog />
				</IconButton>
				<IconButton.Destructive onClick={onDeleteDocument}>
					<HiOutlineTrash />
				</IconButton.Destructive>
			</div>
			<ClockSvg
				className="self-center"
				currentTicks={document.data.details.current}
				totalTicks={document.data.details.max}
				padding={2}
				radius={70}
			/>
		</NarrowContent>
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
		return <div className="p-6">Loading...</div>;
	}

	return (
		<div className="p-6">
			<ClockEdit
				clock={clockData}
				onUpdateClock={(updater) => {
					onUpdateClock(updater);
					resolve(false);
				}}
			/>
		</div>
	);
}
