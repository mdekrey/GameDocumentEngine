import { z } from 'zod';
import { useForm } from '@/utils/form';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import type { FieldMapping } from '@/utils/form';
import { CheckboxField } from '@/components/form-fields/checkbox-input/checkbox-field';
import { useTranslation } from 'react-i18next';
import {
	NotSelected,
	SelectField,
} from '@/components/form-fields/select-input/select-field';
import { noChange } from '@/utils/form';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import { createInvitation } from '@/utils/security/permission-strings';
import { hasGamePermission } from '@/utils/security/match-permission';
import type { FieldsConfig } from '@/utils/form';
import { useGame, useTranslationForGame } from '@/utils/api/hooks';
import { ModalForm } from '@/utils/modal/modal-form';

const CreateInviteForm = z.object({
	uses: z.number(),
	role: z.string().min(1),
});

function useCreateInvite(gameId: string) {
	const queryClient = useQueryClient();
	const createInvite = useMutation(
		queries.createInvitation(queryClient, gameId),
	);
	return createInvite;
}

const unlimitedCheckboxMapping: FieldMapping<number, boolean> = {
	toForm: (v: number) => v === -1,
	fromForm: (v: boolean) => (v ? -1 : 1),
};

const positiveIntegerMapping: FieldMapping<number, string> = {
	toForm: (v: number) => (v < 1 ? '' : v.toFixed(0)),
	fromForm: (v: string) => {
		const result = Number.parseInt(v, 10);
		return Number.isNaN(result) || result < 1 ? noChange : result;
	},
};

type FormType = z.infer<typeof CreateInviteForm>;

export function CreateInvite({
	resolve,
	reject,
	additional: { gameId },
}: ModalContentsProps<
	boolean,
	{
		gameId: string;
	}
>) {
	const { t } = useTranslation(['create-invite']);
	const roleTranslations = useTranslationForGame(gameId);
	const createInvite = useCreateInvite(gameId);
	const form = useForm({
		schema: CreateInviteForm,
		defaultValue: { uses: -1, role: '' },
		translation: t,
		fields: {
			uses: {
				path: ['uses'],
				mapping: positiveIntegerMapping,
				disabled: ({ value }) => value.uses < 1,
			},
			role: ['role'],
			isUnlimited: {
				path: ['uses'],
				translationPath: ['isUnlimited'],
				mapping: unlimitedCheckboxMapping,
			},
			// TODO: TypeScript updates may eliminate this explicit `satisfies`,
			// but otherwise this seems to be required.
		} satisfies FieldsConfig<FormType>,
	});
	const gameData = useGame(gameId);
	const allowedRoles = gameData.typeInfo.userRoles.filter((role) =>
		hasGamePermission(gameData, (id) => createInvitation(id, role)),
	);

	return (
		<ModalForm
			onSubmit={form.handleSubmit(onSubmit)}
			translation={t}
			onCancel={() => reject('Cancel')}
		>
			<Fieldset>
				<SelectField field={form.fields.role} items={allowedRoles}>
					{(dt) =>
						dt ? (
							<>{roleTranslations(`roles.${dt}.name`)}</>
						) : (
							<NotSelected>
								{form.fields.role.translation('not-selected')}
							</NotSelected>
						)
					}
				</SelectField>
				<CheckboxField field={form.fields.isUnlimited} />
				<NumberField field={form.fields.uses} />
			</Fieldset>
		</ModalForm>
	);

	async function onSubmit(data: FormType) {
		await createInvite.mutateAsync(data);
		resolve(true);
	}
}
