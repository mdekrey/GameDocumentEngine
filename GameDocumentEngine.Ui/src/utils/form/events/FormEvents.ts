import type { IFieldEvents } from './FieldEvents';

const submitEvent = 'submit';
const anyBlurEvent = 'blur';
const anyChangeEvent = 'change';
type FormEventNames =
	| typeof submitEvent
	| typeof anyBlurEvent
	| typeof anyChangeEvent;

export class FormEvents implements IFieldEvents {
	static readonly Submit = submitEvent;
	static readonly AnyBlur = anyBlurEvent;
	static readonly AnyChange = anyChangeEvent;
	private readonly target = new EventTarget();

	addEventListener(
		event: FormEventNames,
		eventListener: EventListenerOrEventListenerObject,
		options?: AddEventListenerOptions | boolean,
	) {
		this.target.addEventListener(event, eventListener, options);
	}

	removeEventListener(
		event: FormEventNames,
		eventListener: EventListenerOrEventListenerObject,
		options?: AddEventListenerOptions | boolean,
	) {
		this.target.removeEventListener(event, eventListener, options);
	}

	dispatchEvent(event: FormEventNames) {
		console.log('form', event);
		this.target.dispatchEvent(new Event(event));
	}
}
