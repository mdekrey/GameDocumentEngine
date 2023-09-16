import { useFormFields } from '@/utils/form/useFormFields';
import { GameObjectFormComponent } from '../defineDocument';
import { useSubmitOnChange } from '../useSubmitOnChange';
import { Conflict } from './conflict-types';
import { OrganizerForm } from './parts/organizer-form';
import { GeneralDisplay } from './parts/general-display';
import { Fragment } from 'react';
import { ManageSide } from './ManageSide';

export function ConflictSheet({
	form,
	onSubmit,
	translation: t,
	objectRole,
}: GameObjectFormComponent<Conflict>) {
	useSubmitOnChange(form, onSubmit);
	const fields = useFormFields(form, {
		name: ['name'],
		general: ['details', 'general'],
		sideAName: ['details', 'sideA', 'name'],
		sideBName: ['details', 'sideB', 'name'],
		sideA: { path: ['details', 'sideA'], translationPath: ['details', 'side'] },
		sideB: { path: ['details', 'sideB'], translationPath: ['details', 'side'] },
	});

	const isSideB = objectRole?.includes('side-b') ?? false;

	const yourSide = objectRole?.includes('side-a')
		? fields.sideA
		: objectRole?.includes('side-b')
		? fields.sideB
		: undefined;
	// const otherSide = objectRole?.includes('side-a')
	// 	? fields.sideB
	// 	: objectRole?.includes('side-b')
	// 	? fields.sideA
	// 	: undefined;

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="flex flex-col gap-2"
		>
			{objectRole === 'organizer' ? (
				<OrganizerForm
					name={fields.name}
					general={fields.general}
					sideAName={fields.sideAName}
					sideBName={fields.sideBName}
				/>
			) : (
				<Fragment key={objectRole}>
					<GeneralDisplay
						conflictAtom={form.atom}
						translation={t}
						isSideBFirst={isSideB}
						sideA={fields.sideA}
						sideB={fields.sideB}
					/>
					{yourSide && <ManageSide side={yourSide} />}
				</Fragment>
			)}
		</form>
	);
}
