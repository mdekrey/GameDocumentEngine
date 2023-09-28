import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';
import type { ConflictDocument, SideState } from '../conflict-types';
import type { TFunction } from 'i18next';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import type { FormFieldReturnType } from '@/utils/form/useForm';
import { SideSummary } from './SideSummary';

function skillsList(skills: string[]) {
	return skills
		.map((entry) => entry[0].toUpperCase() + entry.substring(1))
		.join(', ');
}

export function GeneralDisplay({
	conflictAtom,
	translation: t,
	sideA,
	sideB,
	isSideBFirst,
}: {
	conflictAtom: Atom<ConflictDocument>;
	translation: TFunction<`doc-types:${string}`, undefined>;
	sideA: FormFieldReturnType<SideState>;
	sideB: FormFieldReturnType<SideState>;
	isSideBFirst: boolean;
}) {
	const skillsValue = useAtomValue(
		useComputedAtom((get) => get(conflictAtom).details.general.skills),
	);
	const firstSide = isSideBFirst ? sideB : sideA;
	const secondSide = isSideBFirst ? sideA : sideB;
	return (
		<>
			<dl className="grid grid-cols-2 grid-rows-4 grid-flow-row md:grid-cols-4 md:grid-rows-2 md:grid-flow-col gap-2 md:justify-items-center">
				<dt className="font-bold">{t('general.skills.attack')}</dt>
				<dd>{skillsList(skillsValue.attack)}</dd>

				<dt className="font-bold">{t('general.skills.defend')}</dt>
				<dd>{skillsList(skillsValue.defend)}</dd>

				<dt className="font-bold">{t('general.skills.feint')}</dt>
				<dd>{skillsList(skillsValue.feint)}</dd>

				<dt className="font-bold">{t('general.skills.maneuver')}</dt>
				<dd>{skillsList(skillsValue.maneuver)}</dd>
			</dl>
			<div className="grid grid-cols-2 gap-2 justify-items-center">
				<SideSummary side={firstSide} />
				<SideSummary side={secondSide} />
			</div>
		</>
	);
}
