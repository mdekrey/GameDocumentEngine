import type { FormFieldReturnType, UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import type { CharacterDocument } from '../character-types';
import { type Skill, skillSchema } from '../character-types';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { PassFail } from '../components/pass-fail';
import type { FieldMapping } from '@/utils/form/useField';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { HiXMark } from 'react-icons/hi2';
import { positions } from '../skill-positions';
import { DocumentPointers } from '@/documents/get-document-pointers';

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

export function Skills({
	form,
	writablePointers,
}: {
	form: UseFormResult<CharacterDocument>;
	writablePointers: DocumentPointers;
}) {
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
	const skills = writablePointers.navigate('details', 'skills');
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
							writablePointers={skills.navigate(index)}
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
							writablePointers={skills.navigate(index + 12)}
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
	writablePointers,
}: {
	skill: FormFieldReturnType<Skill>;
	natureRating: Atom<number>;
	writablePointers: DocumentPointers;
}) {
	const fields = useFormFields(skill, {
		name: { path: ['name'], mapping: skillNameMapping },
		rating: ['rating'],
		advancement: ['advancement'],
	});
	const hasBasePath = writablePointers.contains();
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
				{readonlyName ||
				(!hasBasePath && !writablePointers.contains('name')) ? (
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
						readOnly={!hasBasePath && !writablePointers.contains('rating')}
					/>
				)}
			</div>
			<PassFail
				advancement={fields.advancement}
				maxPasses={maxPasses}
				maxFails={maxFails}
				padToCount={padding}
				readOnly={!hasBasePath && !writablePointers.contains('advancement')}
			/>
		</div>
	);
}
