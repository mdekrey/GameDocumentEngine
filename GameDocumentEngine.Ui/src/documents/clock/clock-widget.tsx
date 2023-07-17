import '@/utils/api/queries';
import type { GameObjectWidgetProps, Updater } from '../defineDocument';
import { ClockSvg } from './clock-svg';
import { NarrowContent } from '@/utils/containers/narrow-content';
import { IconButton } from '@/components/button/icon-button';
import { HiOutlineCog, HiOutlineTrash } from 'react-icons/hi';
import { ModalContentsProps, useModal } from '@/utils/modal/modal-service';
import { ClockEdit } from './clock-edit';
import { Clock, ClockDocument } from './clock-types';

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
			additional: { clock: clockData, onUpdateClock: onUpdateDocument },
			ModalContents: EditModal,
		});
	}
}

function EditModal({
	resolve,
	additional: { clock, onUpdateClock },
}: ModalContentsProps<
	boolean,
	{
		clock: ClockDocument;
		onUpdateClock: Updater<Clock>;
	}
>) {
	return (
		<div className="p-6">
			<ClockEdit
				clock={{
					name: clock.name,
					details: clock.details,
				}}
				onUpdateClock={(updater) => {
					onUpdateClock(updater);
					resolve(false);
				}}
			/>
		</div>
	);
}