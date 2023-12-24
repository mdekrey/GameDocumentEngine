import { useFormFields } from '@/utils/form';
import type { GameObjectFormComponent } from '@/documents/defineDocument';
import { useSubmitOnChange } from '@/documents/useSubmitOnChange';
import type { Conflict } from './conflict-types';
import { OrganizerForm } from './parts/organizer-form';
import { GeneralDisplay } from './parts/general-display';
import { Fragment } from 'react';
import { ManageSide } from './parts/ManageSide';
import { ReadyWatcher } from './parts/ReadyWatcher';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { useAtomValue } from 'jotai';
import { ReviewRevealed } from './parts/ReviewRevealed';
import { useCurrentUser } from '@/utils/api/hooks';

export function ConflictSheet({
	form,
	onSubmit,
	document,
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
	const objectRole = document.userRoles[useCurrentUser().id];
	const isSideB = objectRole?.includes('side-b') ?? false;

	const yourSide = objectRole?.includes('side-a')
		? fields.sideA
		: objectRole?.includes('side-b')
		? fields.sideB
		: undefined;
	const otherSide = objectRole?.includes('side-a')
		? fields.sideB
		: objectRole?.includes('side-b')
		? fields.sideA
		: undefined;

	const yourSideRevealed = useAtomValue(
		useComputedAtom((get) => get((yourSide ?? fields.sideA).atom).revealed),
	);
	const otherSideRevealed = useAtomValue(
		useComputedAtom((get) => get((otherSide ?? fields.sideB).atom).revealed),
	);

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
						isSideBFirst={isSideB}
						sideA={fields.sideA}
						sideB={fields.sideB}
					/>
					{yourSide &&
					otherSide &&
					(objectRole === 'side-a-captain' ||
						objectRole === 'side-b-captain') ? (
						<ReadyWatcher yourSide={yourSide} otherSide={otherSide} />
					) : null}
					{yourSideRevealed && otherSideRevealed ? (
						<ReviewRevealed
							yourSide={yourSide ?? null}
							yourSideRevealed={yourSideRevealed}
							otherSideRevealed={otherSideRevealed}
						/>
					) : (
						yourSide && <ManageSide side={yourSide} />
					)}
				</Fragment>
			)}
		</form>
	);
}
