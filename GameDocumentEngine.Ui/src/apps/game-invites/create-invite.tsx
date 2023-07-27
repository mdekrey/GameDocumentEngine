import { z } from 'zod';
import { useForm } from '@/utils/form/useForm';
import { Button } from '@/components/button/button';
import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import { ModalContentsProps } from '@/utils/modal/modal-service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';
import { GameDetails } from '@/api/models/GameDetails';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { Field } from '@/utils/form/field/field';
import { ErrorsList } from '@/utils/form/errors/errors-list';
import { TextInput } from '@/utils/form/text-input/text-input';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { Atom, useAtomValue } from 'jotai';
import { UseFieldResult } from '@/utils/form/useField';
import { CheckboxField } from '@/utils/form/checkbox-input/checkbox-field';
import { useTranslation } from 'react-i18next';
import { SelectField } from '@/utils/form/select-field/select-field';
import { GameTypeScripts } from '@/utils/api/queries/game-types';

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
	const createInvite = useCreateInvite(gameId);
	const form = useForm({
		schema: CreateInviteForm,
		defaultValue: { uses: -1, role: '' },
		translation: t,
		fields: {
			isUnlimited: {
				path: ['uses'],
				isCheckbox: true,
				mapping: {
					toForm: (v: number) => v === -1,
					fromForm: (v: boolean) => (v ? -1 : 1),
				},
			},
			uses: {
				path: ['uses'],
				mapping: {
					toForm: (v: number) => (v < 1 ? '' : v.toFixed(0)),
					fromForm: (v: string) => {
						const result = Number.parseInt(v);
						if (Number.isNaN(result) || result < 1) return 1;
						return result;
					},
				},
			},
			role: ['role'],
		},
	});

	const disableUsesAtom = useComputedAtom((get) => get(form.atom).uses <= 0);

	return (
		<form className="w-full h-full" onSubmit={form.handleSubmit(onSubmit)}>
			<ModalDialogLayout>
				<ModalDialogLayout.Title>{t('title')}</ModalDialogLayout.Title>

				<Fieldset>
					<SelectField
						field={form.fields.role}
						items={gameData.typeInfo.userRoles}
						valueSelector={(dt) => dt}
					>
						{(dt) => <>{gameType.translation?.(`roles.${dt}.name`)}</>}
					</SelectField>
					<CheckboxField {...form.fields.isUnlimited.standardProps}>
						<CheckboxField.Label>
							{t('fields.isUnlimited.label')}
						</CheckboxField.Label>
						<CheckboxField.Contents>
							<ErrorsList
								errors={form.fields.isUnlimited.errors}
								translations={(p) => t(`fields.uses.${p.join('.')}`)}
							/>
						</CheckboxField.Contents>
					</CheckboxField>
					<NumberOfUses field={form.fields.uses} disabled={disableUsesAtom} />
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

function NumberOfUses({
	disabled: disabledAtom,
	field,
}: {
	disabled: Atom<boolean>;
	field: UseFieldResult<
		number,
		string,
		{ hasErrors: true; isCheckbox: false; hasTranslations: true }
	>;
}) {
	const disabled = useAtomValue(disabledAtom);
	return (
		<Field>
			<Field.Label className={disabled ? 'text-gray-500' : ''}>
				{field.translation(['label'])}
			</Field.Label>
			<Field.Contents>
				<TextInput disabled={disabled} {...field.standardProps} />
				<ErrorsList errors={field.errors} translations={field.translation} />
			</Field.Contents>
		</Field>
	);
}
