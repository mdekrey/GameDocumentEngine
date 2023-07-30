import {
	FormFieldReturnType,
	UseFormResult,
	useFormFields,
} from '@/utils/form/useForm';
import { CharacterDocument } from '../character-types';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { TextField } from '@/utils/form/text-field/text-field';
import { Atom, useAtomValue } from 'jotai';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { GiPlainCircle, GiCircle } from 'react-icons/gi';
import { IconType } from 'react-icons';
import { useTranslation } from 'react-i18next';

export function Abilities({
	form,
}: {
	form: UseFormResult<CharacterDocument>;
}) {
	const abilities = useFormFields(form, {
		nature: ['details', 'abilities', 'nature'],
		will: ['details', 'abilities', 'will'],
		health: ['details', 'abilities', 'health'],
		resources: ['details', 'abilities', 'resources'],
		circles: ['details', 'abilities', 'circles'],
	});
	return (
		<>
			<Fieldset>
				<NatureAbility nature={abilities.nature} />
				<StandardAbility ability={abilities.will} padToCount={6} />
				<StandardAbility ability={abilities.health} padToCount={6} />
			</Fieldset>
			<Fieldset>
				<StandardAbility ability={abilities.resources} padToCount={10} />
				<StandardAbility ability={abilities.circles} padToCount={10} />
			</Fieldset>
		</>
	);
}

export function NatureAbility({
	nature,
}: {
	nature: FormFieldReturnType<
		CharacterDocument['details']['abilities']['nature']
	>;
}) {
	const fields = useFormFields(nature, {
		current: ['current'],
		max: ['max'],
		advancement: ['advancement'],
	});
	return (
		<div className="flex flex-row col-span-2 gap-2">
			<div className="text-xl font-bold self-center flex-1">
				{nature.translation(['label'])}
			</div>
			<div className="flex flex-row gap-2 items-center">
				<TextField.Integer
					contentsClassName="w-10"
					labelClassName="sr-only"
					inputClassName="text-center"
					field={fields.current}
				/>
				/
				<TextField.Integer
					contentsClassName="w-10"
					labelClassName="sr-only"
					inputClassName="text-center"
					field={fields.max}
				/>
			</div>
			<PassFail
				advancement={fields.advancement}
				rating={fields.max.valueAtom}
				padToCount={6}
			/>
		</div>
	);
}

export function StandardAbility({
	ability,
	padToCount,
}: {
	ability: FormFieldReturnType<{
		advancement: {
			passes: number;
			fails: number;
		};
		rating: number;
	}>;
	padToCount: number;
}) {
	const fields = useFormFields(ability, {
		rating: ['rating'],
		advancement: ['advancement'],
	});
	return (
		<div className="flex flex-row col-span-2 gap-2">
			<div className="text-xl font-bold self-center flex-1">
				{ability.translation(['label'])}
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
				rating={fields.rating.valueAtom}
				padToCount={padToCount}
			/>
		</div>
	);
}

export function PassFail({
	advancement,
	rating,
	padToCount,
}: {
	advancement: FormFieldReturnType<{ passes: number; fails: number }>;
	rating: Atom<number>;
	padToCount: number;
}) {
	const { t } = useTranslation('doc-types:MouseGuard-Character', {
		keyPrefix: 'character-sheet.passes-and-fails',
	});
	const fields = useFormFields(advancement, {
		passes: ['passes'],
		fails: ['fails'],
	});
	const passesUncheckedChecked = useComputedAtom(
		(get) => get(rating) - get(fields.passes.valueAtom),
	);
	const failsUncheckedChecked = useComputedAtom(
		(get) => get(rating) - 1 - get(fields.fails.valueAtom),
	);
	const spacing = useComputedAtom((get) => padToCount - get(rating));

	return (
		<div className="flex flex-col justify-between">
			<div className="flex gap-2 items-center">
				<span>{t('pass-abbrev')}:</span>
				<TextField.Integer className="block sr-only" field={fields.passes} />
				<CheckboxesButton
					count={fields.passes.valueAtom}
					filled
					title={fields.passes.translation('increase')}
					onClick={() => adjust('passes', -1)}
				/>
				<CheckboxesButton
					count={passesUncheckedChecked}
					title={fields.passes.translation('decrease')}
					onClick={() => adjust('passes', 1)}
				/>
				<span className="inline-flex gap-2 invisible">
					<EmptyCirclesFromAtom count={spacing} />
				</span>
			</div>
			<div className="flex gap-2 items-center">
				<span>{t('fail-abbrev')}:</span>
				<TextField.Integer className="block sr-only" field={fields.fails} />
				<CheckboxesButton
					count={fields.fails.valueAtom}
					filled
					title={fields.fails.translation('increase')}
					onClick={() => adjust('fails', -1)}
				/>
				<CheckboxesButton
					count={failsUncheckedChecked}
					title={fields.fails.translation('decrease')}
					onClick={() => adjust('fails', 1)}
				/>
			</div>
		</div>
	);

	function adjust(type: keyof typeof fields, modifier: 1 | -1) {
		fields[type].setValue((prev) => prev + modifier);
		fields[type].onBlur();
	}
}

function CheckboxesButton({
	count,
	filled,
	title,
	onClick,
}: {
	count: Atom<number>;
	filled?: boolean;
	title: string;
	onClick?: () => void;
}) {
	const value = useAtomValue(count);
	if (value === 0) return null;
	return (
		<button
			type="button"
			disabled={value === 0}
			className="inline-flex gap-2"
			title={title}
			onClick={onClick}
		>
			{filled ? (
				<FilledCircles value={value} />
			) : (
				<EmptyCircles value={value} />
			)}
		</button>
	);
}

function RepeatIcon({ value, icon: Icon }: { value: number; icon: IconType }) {
	return (
		<>
			{Array(Math.max(0, value))
				.fill(0)
				.map((_, index) => (
					<Icon key={index} aria-role="img" />
				))}
		</>
	);
}

function FilledCircles({ value }: { value: number }) {
	return <RepeatIcon value={value} icon={GiPlainCircle} />;
}

function EmptyCircles({ value }: { value: number }) {
	return <RepeatIcon value={value} icon={GiCircle} />;
}

function EmptyCirclesFromAtom({ count }: { count: Atom<number> }) {
	const value = useAtomValue(count);
	return <EmptyCircles value={value} />;
}
