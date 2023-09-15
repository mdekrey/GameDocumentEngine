import { Atom, useAtomValue } from 'jotai';
import { ConflictGeneral } from '../conflict-types';
import { TFunction } from 'i18next';

function skillsList(skills: string[]) {
	return skills
		.map((entry) => entry[0].toUpperCase() + entry.substring(1))
		.join(', ');
}

export function GeneralDisplay({
	general,
	translation: t,
}: {
	general: Atom<ConflictGeneral>;
	translation: TFunction<`doc-types:${string}`, undefined>;
}) {
	const generalValue = useAtomValue(general);
	return (
		<dl className="grid grid-cols-2 grid-rows-4 grid-flow-row md:grid-cols-4 md:grid-rows-2 md:grid-flow-col">
			<dt className="font-bold">{t('general.skills.attack')}</dt>
			<dd>{skillsList(generalValue.skills.attack)}</dd>

			<dt className="font-bold">{t('general.skills.defend')}</dt>
			<dd>{skillsList(generalValue.skills.defend)}</dd>

			<dt className="font-bold">{t('general.skills.feint')}</dt>
			<dd>{skillsList(generalValue.skills.feint)}</dd>

			<dt className="font-bold">{t('general.skills.maneuver')}</dt>
			<dd>{skillsList(generalValue.skills.maneuver)}</dd>
		</dl>
	);
}
