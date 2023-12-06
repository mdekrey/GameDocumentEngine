import { atom, useSetAtom, useStore } from 'jotai';
import { type DraggingMimeTypes, allMimeTypes } from './mime-types';
import { getData } from './base';

type MimeAndData<T extends keyof DraggingMimeTypes = keyof DraggingMimeTypes> =
	{
		[K in T]: {
			mimeType: K;
		} & DraggingMimeTypes[K];
	}[T];
const draggingGameObject = atom<MimeAndData | undefined>(undefined);

type AllowedDragEffect = {
	readonly copy: boolean;
	readonly move: boolean;
	readonly link: boolean;
};
type DropEffect = DataTransfer['dropEffect'];

const mapAllowedEffect: Record<
	DataTransfer['effectAllowed'],
	AllowedDragEffect
> = {
	none: { copy: false, move: false, link: false },
	copy: { copy: true, move: false, link: false },
	copyLink: { copy: true, move: false, link: true },
	copyMove: { copy: true, move: true, link: false },
	link: { copy: false, move: false, link: true },
	linkMove: { copy: false, move: true, link: true },
	move: { copy: false, move: true, link: false },
	all: { copy: true, move: true, link: true },
	uninitialized: { copy: true, move: true, link: true },
};

export function useDraggable<T extends keyof DraggingMimeTypes>(
	mimeType: T,
	data: DraggingMimeTypes[T],
	effect: DataTransfer['effectAllowed'],
) {
	const setDraggingDocument = useSetAtom(draggingGameObject);

	function onDragStart(ev: React.DragEvent<unknown>) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
		setDraggingDocument({ mimeType, ...data } as MimeAndData<any>);
		ev.dataTransfer.setData(mimeType, JSON.stringify(data));
		ev.dataTransfer.effectAllowed = effect;
	}

	function onDragEnd() {
		setDraggingDocument(undefined);
	}

	return {
		onDragEnd,
		onDragStart,
	};
}

type DropHandler<T extends keyof DraggingMimeTypes = keyof DraggingMimeTypes> =
	{
		canHandle: (
			this: void,
			effectAllowed: AllowedDragEffect,
			data?: DraggingMimeTypes[T],
		) => false | DropEffect;
		handle: (
			this: void,
			ev: React.DragEvent<unknown>,
			data: DraggingMimeTypes[T],
		) => boolean;
	};

type MimeTypeHandlers = {
	[T in keyof DraggingMimeTypes]: DropHandler<T>;
};

function isMimeType(mimeType: string): mimeType is keyof DraggingMimeTypes {
	return allMimeTypes.includes(mimeType as keyof DraggingMimeTypes);
}

export function useDropTarget(handlers: Partial<MimeTypeHandlers>) {
	const store = useStore();
	return {
		onDragOver: handleDragOver,
		onDragEnter: handleDragOver,
		onDrop: handleDrop,
	};

	function handleDragOver(ev: React.DragEvent<unknown>) {
		const currentWindowDragging = store.get(draggingGameObject);
		if (currentWindowDragging) {
			if (!(currentWindowDragging.mimeType in handlers)) return;
			const handler = handlers[currentWindowDragging.mimeType];
			if (!handler) return;
			checkHandling(ev, handler as DropHandler, currentWindowDragging);
			return;
		}
		for (const mimeType of ev.dataTransfer.types) {
			if (!isMimeType(mimeType) || !(mimeType in handlers)) continue;
			const handler = handlers[mimeType];
			if (handler && checkHandling(ev, handler as DropHandler)) return;
		}
	}

	function handleDrop(ev: React.DragEvent<unknown>) {
		for (const mimeType of ev.dataTransfer.types) {
			if (!isMimeType(mimeType) || !(mimeType in handlers)) continue;
			const handler = handlers[mimeType];
			if (handler && checkHandling(ev, handler as DropHandler)) {
				if (
					handler.handle(
						ev,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
						getData(mimeType, ev.dataTransfer) as any,
					)
				) {
					ev.preventDefault();
					return;
				}
			}
		}
	}

	function checkHandling(
		ev: React.DragEvent<unknown>,
		handler: DropHandler,
		data?: DraggingMimeTypes[keyof DraggingMimeTypes],
	) {
		const handleResult = handler.canHandle(
			mapAllowedEffect[ev.dataTransfer.effectAllowed],
			data,
		);
		if (!handleResult) return false;
		ev.dataTransfer.dropEffect = handleResult;
		ev.preventDefault();
		return true;
	}
}
