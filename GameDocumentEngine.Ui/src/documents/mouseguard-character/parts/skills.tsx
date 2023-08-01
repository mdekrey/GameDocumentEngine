import { FormFieldReturnType, UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { CharacterDocument, Skill, skillSchema } from '../character-types';
import { useDebugValue } from 'react';
import { TextField } from '@/utils/form/text-field/text-field';
import { PassFail } from '../components/pass-fail';
import { FieldMapping } from '@/utils/form/useField';

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

	return (
		<>
			{Array(24)
				.fill(0)
				.map((_, index) => (
					<Skill key={index} skill={fields.skills(index)} />
				))}
		</>
	);
}

export function Skill({ skill }: { skill: FormFieldReturnType<Skill> }) {
	const fields = useFormFields(skill, {
		name: ['name'],
		rating: ['rating'],
		advancement: ['advancement'],
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
				rating={fields.rating.value}
				padToCount={5}
			/>
		</div>
	);
}
