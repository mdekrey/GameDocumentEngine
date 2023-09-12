import type { FormFieldReturnType, UseFormResult } from '@/utils/form/useForm';
import { useFormFields } from '@/utils/form/useFormFields';
import type { CharacterDocument } from '../character-types';
import { type Trait, traitSchema } from '../character-types';
import { TextField } from '@/components/form-fields/text-input/text-field';
import type { FieldMapping } from '@/utils/form/useField';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';
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
		<div className="flex flex-col gap-2">
			{Array(5)
				.fill(0)
				.map((_, index) => (
					<Trait key={index} trait={fields.traits(index)} />
				))}
		</div>
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
		<div className="flex flex-row col-span-2 gap-4">
			<div className="self-center w-64">
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
			<TraitUsedFor level={fields.level.value} usedFor={fields.usedFor} />
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
			className="inline-flex gap-1 items-center"
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
	readOnly,
}: {
	level: Atom<number>;
	usedFor: FormFieldReturnType<number>;
	readOnly?: boolean;
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
		<div className="flex flex-row gap-2 items-center">
			{usedFor.translation('label')}:
			<CheckboxList
				checkedCount={usedFor.value}
				uncheckedCount={usedForAvailable}
				paddingCount={0}
				checkedTitle={usedFor.translation('decrease')}
				uncheckedTitle={usedFor.translation('increase')}
				onUncheck={() => !readOnly && usedFor.onChange((v) => v - 1)}
				onCheck={() => !readOnly && usedFor.onChange((v) => v + 1)}
			/>
		</div>
	);
}
