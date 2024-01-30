export const filePickerCancelled = Symbol('filePickerCancelled');

export type SelectFileOptions = {
	accept?: string;
};

export function launchFilePicker({ accept }: SelectFileOptions = {}): Promise<
	File[]
> {
	const el = document.createElement('input');
	el.setAttribute('type', 'file');
	if (accept) el.accept = accept;
	return new Promise<File[]>((resolve, reject) => {
		document.body.appendChild(el);

		el.addEventListener(
			'change',
			() => {
				if (!el.files) throw new Error('Input was not a file type');
				resolve(Array.from(el.files));
			},
			{ once: true },
		);

		window.addEventListener(
			'focus',
			// file dialog closed, and the "change" event fires after, so we delay it
			() => setTimeout(() => reject(filePickerCancelled), 300),
			{ once: true },
		);

		// open file select box
		el.click();
	}).finally(() => {
		// remove dom
		document.body.removeChild(el);
	});
}
