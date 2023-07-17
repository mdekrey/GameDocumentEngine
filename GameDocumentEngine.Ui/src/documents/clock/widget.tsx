import '@/utils/api/queries';
import { GameObjectWidgetProps } from '../defineDocument';
import { z } from 'zod';
import { ClockSvg } from './clock-svg';
import { NarrowContent } from '@/utils/containers/narrow-content';
import { IconButton } from '@/components/button/icon-button';
import { HiOutlineCog, HiOutlineTrash } from 'react-icons/hi';

export function Clock({
	document,
	onDeleteDocument,
	onUpdateDocument,
}: GameObjectWidgetProps<z.infer<typeof import('./schema')['default']>>) {
	if (!document.data) {
		return <>Loading...</>;
	}

	return (
		<NarrowContent>
			<div className="flex flex-row gap-3">
				<span className="font-bold flex-1">{document.data.name}</span>
				<IconButton
					onClick={() =>
						onUpdateDocument((clock) => (clock.details.current += 1))
					}
				>
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
			{document.data.details.current} of {document.data.details.max}
		</NarrowContent>
	);
}
