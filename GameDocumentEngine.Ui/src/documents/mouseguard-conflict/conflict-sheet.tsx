import { GameObjectFormComponent } from '../defineDocument';
import { useSubmitOnChange } from '../useSubmitOnChange';
import { Conflict } from './conflict-types';

export function ConflictSheet({
	form,
	onSubmit,
	translation: t,
}: GameObjectFormComponent<Conflict>) {
	useSubmitOnChange(form, onSubmit);

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="flex flex-col gap-2"
		>
			{t('todo')}
		</form>
	);
}
