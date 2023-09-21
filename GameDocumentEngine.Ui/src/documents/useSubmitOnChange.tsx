import { useEffect } from 'react';
import { UseFormResult } from '@/utils/form/useForm';
import { FormEvents } from '@/utils/form/events/FormEvents';

export function useSubmitOnChange<T>(
	form: UseFormResult<T>,
	onSubmit: (data: T) => void | Promise<void>,
) {
	useEffect(() => {
		form.formEvents.addEventListener(FormEvents.AnyBlur, submitOnChange);
		return () => {
			form.formEvents.removeEventListener(FormEvents.AnyBlur, submitOnChange);
		};

		function submitOnChange() {
			console.log('submit on change');
			form.handleSubmit(onSubmit)();
		}
	}, [form, onSubmit]);
}
