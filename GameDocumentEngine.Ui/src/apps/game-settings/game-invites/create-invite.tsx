import { z } from 'zod';
import { useForm } from '@/utils/form/useForm';
import { Button } from '@/components/button/button';
import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import type { GameDetails } from '@/api/models/GameDetails';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import type { FieldMapping, FieldStateContext } from '@/utils/form/useField';
import { CheckboxField } from '@/components/form-fields/checkbox-input/checkbox-field';
import { useTranslation } from 'react-i18next';
import { SelectField } from '@/components/form-fields/select-input/select-field';
import type { GameTypeScripts } from '@/utils/api/queries/game-types';
import { noChange } from '@/utils/form/mapAtom';
import { NumberField } from '@/components/form-fields/text-input/number-field';
import { createInvitation } from '@/utils/security/permission-strings';
import { hasGamePermission } from '@/utils/security/match-permission';
import { atom } from 'jotai';

const CreateInviteForm = z.object({
	uses: z.number(),
	role: z.string().nonempty(),
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

export function CreateInvite({
	resolve,
	reject,
	additional: { gameId, gameData, gameType },
}: ModalContentsProps<
	boolean,
	{
		gameId: string;
		gameData: GameDetails;
		gameType: GameTypeScripts;
	}
>) {
	const { t } = useTranslation(['create-invite']);
	const { t: roleTranslations } = useTranslation(gameType.translationNamespace);
	const createInvite = useCreateInvite(gameId);
	const form = useForm({
		schema: CreateInviteForm,
		defaultValue: { uses: -1, role: '' },
		translation: t,
		fields: {
			uses: {
				path: ['uses'],
				mapping: positiveIntegerMapping,
				// TODO: why does this parameter need to be explicitly typed?
				disabled: (v: FieldStateContext<number>) =>
					atom((get) => get(v.value) < 1),
			},
			role: ['role'],
			isUnlimited: {
				path: ['uses'],
				translationPath: ['isUnlimited'],
				mapping: unlimitedCheckboxMapping,
			},
		},
	});

	const allowedRoles = gameData.typeInfo.userRoles.filter((role) =>
		hasGamePermission(gameData, (id) => createInvitation(id, role)),
	);

	return (
		<form className="w-full h-full" onSubmit={form.handleSubmit(onSubmit)}>
			<ModalDialogLayout>
				<ModalDialogLayout.Title>{t('title')}</ModalDialogLayout.Title>

				<Fieldset>
					<SelectField field={form.fields.role} items={allowedRoles}>
						{(dt) =>
							dt ? (
								<>{roleTranslations(`roles.${dt}.name`)}</>
							) : (
								form.fields.role.translation('not-selected')
							)
						}
					</SelectField>
					<CheckboxField field={form.fields.isUnlimited} />
					<NumberField field={form.fields.uses} />
				</Fieldset>

				<ModalDialogLayout.Buttons>
					<Button.Save type="submit">{t('submit')}</Button.Save>
					<Button.Secondary onClick={() => reject('Cancel')}>
						{t('cancel')}
					</Button.Secondary>
				</ModalDialogLayout.Buttons>
			</ModalDialogLayout>
		</form>
	);

	async function onSubmit(data: z.infer<typeof CreateInviteForm>) {
		await createInvite.mutateAsync(data);
		resolve(true);
	}
}
