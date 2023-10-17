import type { FieldMapping, FormFieldReturnType } from '@/utils/form';
import { noChange, useForm, useFormFields } from '@/utils/form';
import { z } from 'zod';
import { ButtonRow } from '../../button/button-row';
import { Button } from '../../button/button';
import { TextField } from '../text-input/text-field';
import { Fieldset } from '../fieldset/fieldset';
import { useTranslation } from 'react-i18next';

const address = z.object({
	line1: z.string(),
	line2: z.string(),
	city: z.string(),
	countrySubdivision: z.string().optional(),
	country: z.string().min(2).max(2),
	postalCode: z.string(),
});
type Address = z.infer<typeof address>;

const myFormSchema = z.object({
	name: z.string(),
	age: z.number().min(18),
	shippingAddress: address,
	billingAddress: address,
});

type MyForm = z.infer<typeof myFormSchema>;
const defaultValue: MyForm = {
	name: '',
	age: 0,
	shippingAddress: {
		line1: '',
		line2: '',
		city: '',
		country: 'US',
		postalCode: '',
	},
	billingAddress: {
		line1: '',
		line2: '',
		city: '',
		country: 'US',
		postalCode: '',
	},
};

// type AnyFunctionParameters = (...args: any[]) => number;
// const myFunction = ((id: string) => 'foo') satisfies AnyFunctionParameters;

type FormDemoProps = {
	onSubmit: (data: MyForm) => void;
};

const positiveIntegerMapping: FieldMapping<number, string> = {
	toForm: (v: number) => (v < 1 ? '' : v.toFixed(0)),
	fromForm: (v: string) => {
		const result = Number.parseInt(v, 10);
		return Number.isNaN(result) || result < 1 ? noChange : result;
	},
};

const uppercaseMapping: FieldMapping<string, string> = {
	toForm: (v: string) => v.toUpperCase(),
	fromForm: (v: string) => {
		return v;
	},
};

export function FormDemo({ onSubmit }: FormDemoProps) {
	const { t } = useTranslation(['demo']);
	const form = useForm({
		schema: myFormSchema,
		defaultValue,
		translation: t,
		fields: {
			name: ['name'],
			age: {
				path: ['age'],
				mapping: positiveIntegerMapping,
			},
			addressLine1: {
				path: ['shippingAddress', 'line1'],
				mapping: uppercaseMapping,
			},
			address: ['shippingAddress'],
			billing: ['billingAddress'],
		},
	});

	return (
		<form className="w-full h-full" onSubmit={form.handleSubmit(onSubmit)}>
			<Fieldset>
				{t('fields.name.label')}
				<TextField field={form.fields.name} />
				<TextField field={form.fields.age} />
				<TextField field={form.fields.addressLine1} />
				<AddressField field={form.fields.address} />
				<AddressField field={form.fields.billing} />
				<ButtonRow>
					<Button type="submit">{t('submit')}</Button>
				</ButtonRow>
			</Fieldset>
		</form>
	);
}

function AddressField({ field }: { field: FormFieldReturnType<Address> }) {
	const fields = useFormFields(field, {
		addressLine1: ['line1'],
		country: ['country'],
	});

	return (
		<>
			<TextField field={fields.addressLine1} />
			<TextField field={fields.country} />
		</>
	);
}
