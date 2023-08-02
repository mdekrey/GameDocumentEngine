import { FormFieldReturnType, UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import { CharacterDocument, Trait, traitSchema } from '../character-types';
import { TextField } from '@/utils/form-fields/text-field/text-field';
import { FieldMapping } from '@/utils/form/useField';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { Atom, useAtomValue } from 'jotai';
import { GiPlainCircle, GiCircle } from 'react-icons/gi';
import { CheckboxList } from '../components/CheckboxList';

const requiredTraitMapping: FieldMapping<Trait | null, Trait> = {
	toForm: (v) => v ?? { name: '', level: 0, usedFor: 0 },
	fromForm: (v) => (v.level < 1 && v.usedFor === 0 && v.name === '' ? null : v),
};

export function Traits({ form }: { form: UseFormResult<CharacterDocument> }) {
	const fields = useFormFields(form, {
		traits: (traitIndex: number) =>
			({
				path: ['details', 'traits', traitIndex],
				mapping: requiredTraitMapping,
				schema: traitSchema,
				translationPath: ['details', 'traits'],
			}) as const,
	});

	return (
		<>
			{Array(5)
				.fill(0)
				.map((_, index) => (
					<Trait key={index} trait={fields.traits(index)} />
				))}
		</>
	);
}

const traitNameMapping: FieldMapping<string, string> = {
	toForm: (v) => (v.length ? `${v[0].toUpperCase()}${v.substring(1)}` : v),
	fromForm: (v) => v.toLowerCase(),
};

export function Trait({ trait }: { trait: FormFieldReturnType<Trait> }) {
	const fields = useFormFields(trait, {
		name: { path: ['name'], mapping: traitNameMapping },
		level: ['level'],
		usedFor: ['usedFor'],
	});

	const level1Checked = useComputedAtom((get) => get(fields.level.value) >= 1);
	const level2Checked = useComputedAtom((get) => get(fields.level.value) >= 2);
	const level3Checked = useComputedAtom((get) => get(fields.level.value) >= 3);

	const readonlyNameAtom = useComputedAtom((get) => {
		return get(fields.level.value) > 0 ? get(fields.name.value) : null;
	});
	const readonlyName = useAtomValue(readonlyNameAtom);

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
				{/* TODO: aria */}
				<TraitLevelButton
					checked={level1Checked}
					level={1}
					translation={fields.level.translation}
					onClick={toggleLevel(1)}
				/>
				<TraitLevelButton
					checked={level2Checked}
					level={2}
					translation={fields.level.translation}
					onClick={toggleLevel(2)}
				/>
				<TraitLevelButton
					checked={level3Checked}
					level={3}
					translation={fields.level.translation}
					onClick={toggleLevel(3)}
				/>
			</div>
			<div className="flex flex-row gap-2 items-center">
				{fields.usedFor.translation('label')}:
				<TraitUsedFor level={fields.level.value} usedFor={fields.usedFor} />
			</div>
		</div>
	);

	function toggleLevel(level: number) {
		return () => {
			fields.level.onChange((current) => current + (current < level ? 1 : -1));
		};
	}
}

function TraitLevelButton({
	checked: checkedAtom,
	level,
	translation,
	onClick,
	onBlur,
}: {
	checked: Atom<boolean>;
	level: number;
	translation: (key: string) => string;
	onClick?: () => void;
	onBlur?: () => void;
}) {
	const checked = useAtomValue(checkedAtom);
	const title = checked ? translation('decrease') : translation('increase');
	return (
		<button
			type="button"
			className="inline-flex items-center"
			title={title}
			aria-label={title}
			onClick={onClick}
			onBlur={onBlur}
		>
			<span>{level}:</span>
			{checked ? <GiPlainCircle /> : <GiCircle />}
		</button>
	);
}

function TraitUsedFor({
	level,
	usedFor,
}: {
	level: Atom<number>;
	usedFor: FormFieldReturnType<number>;
}) {
	const usedForAvailable = useComputedAtom((get) => {
		const currentLevel = get(level);
		return currentLevel > 2
			? 0
			: Math.max(currentLevel - get(usedFor.value), 0);
	});
	const isMaxed = useAtomValue(useComputedAtom((get) => get(level) > 2));

	return isMaxed ? (
		<span>{usedFor.translation('always')}</span>
	) : (
		<CheckboxList
			checkedCount={usedFor.value}
			uncheckedCount={usedForAvailable}
			paddingCount={0}
			checkedTitle={usedFor.translation('decrease')}
			uncheckedTitle={usedFor.translation('increase')}
			onUncheck={() => usedFor.onChange((v) => v - 1)}
			onCheck={() => usedFor.onChange((v) => v + 1)}
		/>
	);
}
