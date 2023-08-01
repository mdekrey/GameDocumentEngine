import { FormFieldReturnType, UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { CharacterDocument, Skill, skillSchema } from '../character-types';
import { useDebugValue } from 'react';
import { TextField } from '@/utils/form/text-field/text-field';
import { PassFail } from '../components/pass-fail';
import { FieldMapping } from '@/utils/form/useField';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { Atom } from 'jotai';

const requiredSkillMapping: FieldMapping<Skill | null, Skill> = {
	toForm: (v) =>
		v ?? { name: '', rating: 0, advancement: { passes: 0, fails: 0 } },
	fromForm: (v) =>
		v.rating === 0 &&
		v.advancement.passes === 0 &&
		v.advancement.fails === 0 &&
		v.name === ''
			? null
			: v,
};

export function Skills({ form }: { form: UseFormResult<CharacterDocument> }) {
	const fields = useFormFields(form, {
		skills: (skillIndex: number) => ({
			path: ['details', 'skills', skillIndex],
			mapping: requiredSkillMapping,
			schema: skillSchema,
		}),
	});
	useDebugValue({ fields });
	const natureRating = useComputedAtom(
		(get) => get(form.atom).details.abilities.nature.max,
	);

	return (
		<>
			{Array(24)
				.fill(0)
				.map((_, index) => (
					<Skill
						key={index}
						skill={fields.skills(index)}
						natureRating={natureRating}
					/>
				))}
		</>
	);
}

export function Skill({
	skill,
	natureRating,
}: {
	skill: FormFieldReturnType<Skill>;
	natureRating: Atom<number>;
}) {
	const fields = useFormFields(skill, {
		name: ['name'],
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

	return (
		<div className="flex flex-row col-span-2 gap-2">
			<div className="self-center flex-1">
				<TextField labelClassName="sr-only" field={fields.name} />
			</div>
			<div className="flex flex-row gap-2 items-center">
				<TextField.Integer
					contentsClassName="w-10"
					labelClassName="sr-only"
					inputClassName="text-center"
					field={fields.rating}
				/>
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
