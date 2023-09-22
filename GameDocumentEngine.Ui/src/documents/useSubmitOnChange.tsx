import { useEffect, useRef } from 'react';
import { UseFormResult } from '@/utils/form/useForm';
import { FormEvents } from '@/utils/form/events/FormEvents';

export function useSubmitOnChange<T>(
	form: UseFormResult<T>,
	onSubmit: (data: T) => void | Promise<void>,
) {
	const timeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null);
	const handlerRef = useRef<null | (() => void)>(null);
	if (!handlerRef.current) {
		registerHandler();
	}

	useEffect(() => {
		registerHandler();
		return unregisterHandler;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function registerHandler() {
		if (handlerRef.current) return;
		form.formEvents.addEventListener(FormEvents.AnyChange, submitOnChange);
		handlerRef.current = () => {
			form.formEvents.removeEventListener(FormEvents.AnyChange, submitOnChange);
			handlerRef.current = null;
		};
	}

	function unregisterHandler() {
		if (!handlerRef.current) return;
		handlerRef.current();
	}

	function submitOnChange() {
		if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => {
			form.handleSubmit(onSubmit)();
			timeoutRef.current = null;
		}, 300);
	}
}
