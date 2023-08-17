import { FormFieldReturnType, UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { CharacterDocument, Skill, skillSchema } from '../character-types';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { PassFail } from '../components/pass-fail';
import { FieldMapping } from '@/utils/form/useField';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { Atom, useAtomValue } from 'jotai';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { HiXMark } from 'react-icons/hi2';
import { positions } from '../skill-positions';

const requiredSkillMappingWithDefaultName = (
	defaultName: string,
): FieldMapping<Skill | null, Skill> => ({
	toForm: (v) =>
		v ?? { name: defaultName, rating: 0, advancement: { passes: 0, fails: 0 } },
	fromForm: (v) => {
		return v.rating === 0 &&
			v.advancement.passes === 0 &&
			v.advancement.fails === 0 &&
			(v.name === '' || v.name === defaultName)
			? null
			: v;
	},
});

export function Skills({ form }: { form: UseFormResult<CharacterDocument> }) {
	const fields = useFormFields(form, {
		skills: (skillIndex: number) =>
			({
				path: ['details', 'skills', skillIndex],
				mapping: requiredSkillMappingWithDefaultName(
					positions[skillIndex] ?? '',
				),
				schema: skillSchema,
				translationPath: ['details', 'skills'],
			}) as const,
	});
	const natureRating = useComputedAtom(
		(get) => get(form.atom).details.abilities.nature.max,
	);

	return (
		<div className="flex flex-col md:grid md:grid-cols-2 gap-2">
			<Fieldset>
				{Array(12)
					.fill(0)
					.map((_, index) => (
						<Skill
							key={index}
							skill={fields.skills(index)}
							natureRating={natureRating}
						/>
					))}
			</Fieldset>
			<Fieldset>
				{Array(12)
					.fill(0)
					.map((_, index) => (
						<Skill
							key={index}
							skill={fields.skills(index + 12)}
							natureRating={natureRating}
						/>
					))}
			</Fieldset>
		</div>
	);
}

const skillNameMapping: FieldMapping<string, string> = {
	toForm: (v) => (v.length ? `${v[0].toUpperCase()}${v.substring(1)}` : v),
	fromForm: (v) => v.toLowerCase(),
};

export function Skill({
	skill,
	natureRating,
}: {
	skill: FormFieldReturnType<Skill>;
	natureRating: Atom<number>;
}) {
	const fields = useFormFields(skill, {
		name: { path: ['name'], mapping: skillNameMapping },
		rating: ['rating'],
		advancement: ['advancement'],
	});
	const padding = useComputedAtom((get) => Math.max(5, get(natureRating)));

	const maxPasses = useComputedAtom((get) => {
		const temp = get(fields.rating.value);
		return temp === 0 ? get(natureRating) : get(fields.rating.value);
	});
	const maxFails = useComputedAtom((get) => {
		const temp = get(fields.rating.value);
		return temp === 0 ? get(natureRating) : get(fields.rating.value) - 1;
	});

	const readonlyNameAtom = useComputedAtom((get) => {
		return get(fields.rating.value) > 0 ||
			get(fields.advancement.field(['passes']).value) ||
			get(fields.advancement.field(['fails']).value)
			? get(fields.name.value)
			: null;
	});
	const readonlyName = useAtomValue(readonlyNameAtom);

	const rating0Atom = useComputedAtom((get) => {
		return get(fields.rating.value) === 0 &&
			(get(fields.advancement.field(['passes']).value) ||
				get(fields.advancement.field(['fails']).value))
			? true
			: false;
	});
	const isRating0 = useAtomValue(rating0Atom);

	return (
		<div className="flex flex-row col-span-2 gap-2">
			<div className="self-center flex-1">
				{readonlyName ? (
					<span className="inline-block p-2">{readonlyName}</span>
				) : (
					<TextField labelClassName="sr-only" field={fields.name} />
				)}
			</div>
			<div className="flex flex-row gap-2 items-center">
				{isRating0 ? (
					<span className="w-10 text-center">
						<HiXMark className="w-6 h-6 inline-block" />
					</span>
				) : (
					<TextField.Integer
						contentsClassName="w-10"
						labelClassName="sr-only"
						inputClassName="text-center"
						field={fields.rating}
					/>
				)}
			</div>
			<PassFail
				advancement={fields.advancement}
				maxPasses={maxPasses}
				maxFails={maxFails}
				padToCount={padding}
			/>
		</div>
	);
}
