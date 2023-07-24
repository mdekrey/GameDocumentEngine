/* eslint-disable i18next/no-literal-string */
import { Updater } from '../defineDocument';
import { useForm } from '@/utils/form/useForm';
import { ErrorsList } from '@/utils/form/errors/errors-list';
import { Field } from '@/utils/form/field/field';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { TextInput } from '@/utils/form/text-input/text-input';
import { ButtonRow } from '@/components/button/button-row';
import { Button } from '@/components/button/button';
import { FieldMapping } from '@/utils/form/useField';
import { Clock, ClockDocument } from './clock-types';
import { applyPatch, createPatch } from 'rfc6902';
import { updateFormDefault } from '@/utils/form/update-form-default';

const integerMapping: FieldMapping<number, string> = {
	toForm: (v: number) => v.toFixed(0),
	fromForm: (v: string) => Number.parseInt(v, 10),
};

export function ClockEdit({
	clock,
	onUpdateClock,
}: {
	clock: ClockDocument;
	onUpdateClock: Updater<Clock>;
}) {
	const form = useForm({
		defaultValue: clock,
		schema: ClockDocument,
		fields: {
			name: ['name'],
			current: { path: ['details', 'current'], mapping: integerMapping },
			max: { path: ['details', 'max'], mapping: integerMapping },
		},
	});
	updateFormDefault(form, clock);

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<Fieldset>
				<Field>
					<Field.Label>Name</Field.Label>
					<Field.Contents>
						<TextInput {...form.fields.name.standardProps} />
						<ErrorsList
							errors={form.fields.name.errors}
							prefix="EditDocument.Clock.name"
						/>
					</Field.Contents>
				</Field>
				<Field>
					<Field.Label>Current</Field.Label>
					<Field.Contents>
						<TextInput type="number" {...form.fields.current.standardProps} />
						<ErrorsList
							errors={form.fields.current.errors}
							prefix="EditDocument.Clock.current"
						/>
					</Field.Contents>
				</Field>
				<Field>
					<Field.Label>Max</Field.Label>
					<Field.Contents>
						<TextInput type="number" {...form.fields.max.standardProps} />
						<ErrorsList
							errors={form.fields.max.errors}
							prefix="EditDocument.Clock.max"
						/>
					</Field.Contents>
				</Field>
				<ButtonRow>
					<Button type="submit">Update</Button>
				</ButtonRow>
			</Fieldset>
		</form>
	);

	function onSubmit(currentValue: ClockDocument) {
		const ops = createPatch(clock, currentValue);
		onUpdateClock((prev) => {
			applyPatch(prev, ops);
		});
	}
}
