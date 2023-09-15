import { useFormFields } from '@/utils/form/useFormFields';
import { GameObjectFormComponent } from '../defineDocument';
import { useSubmitOnChange } from '../useSubmitOnChange';
import { Conflict } from './conflict-types';
import { OrganizerForm } from './parts/organizer-form';
import { GeneralDisplay } from './parts/general-display';

export function ConflictSheet({
	form,
	onSubmit,
	translation: t,
	writablePointers,
}: GameObjectFormComponent<Conflict>) {
	useSubmitOnChange(form, onSubmit);
	const fields = useFormFields(form, {
		name: ['name'],
		general: ['details', 'general'],
		sideAName: ['details', 'sideA', 'name'],
		sideBName: ['details', 'sideB', 'name'],
		sideA: ['details', 'sideA'],
		sideB: ['details', 'sideB'],
	});

	/*
	There's several roles for this, several view-only, which will just display
	all info available. For the rest:
	- If general is writable, display general form
	- If display form for side that is writable, if any
	*/
	const mode =
		writablePointers.pointers.length === 0
			? 'read-only'
			: form.store.get(fields.general.readOnlyFields) !== true
			? 'organizer'
			: form.store.get(fields.sideA.readOnlyFields) !== true
			? 'side-a'
			: form.store.get(fields.sideB.readOnlyFields) !== true
			? 'side-b'
			: unknownMode();

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="flex flex-col gap-2"
		>
			{mode === 'organizer' ? (
				<OrganizerForm
					name={fields.name}
					general={fields.general}
					sideAName={fields.sideAName}
					sideBName={fields.sideBName}
				/>
			) : (
				<>
					<GeneralDisplay general={fields.general.atom} translation={t} />
				</>
			)}
		</form>
	);

	function unknownMode() {
		throw new Error('Permissions changed; unknown how to handle');
	}
}
