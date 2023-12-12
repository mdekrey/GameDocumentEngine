import type { DraggingMimeTypes } from './mime-types';

export function getData<const T extends keyof DraggingMimeTypes>(
	mimeType: T,
	dataTransfer: DataTransfer,
) {
	return JSON.parse(dataTransfer.getData(mimeType)) as DraggingMimeTypes[T];
}

export function setData<T extends keyof DraggingMimeTypes>(
	mimeType: T,
	data: DraggingMimeTypes[T],
	dataTransfer: DataTransfer,
) {
	dataTransfer.setData(mimeType, JSON.stringify(data));
}
