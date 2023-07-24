/* eslint-disable i18next/no-literal-string */
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
import { SelectInput } from '@/utils/form/select-input/select-input';
import { ErrorsList } from '@/utils/form/errors/errors-list';
import { TextInput } from '@/utils/form/text-input/text-input';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { Atom, useAtomValue } from 'jotai';
import { UseFieldResult } from '@/utils/form/useField';
import { CheckboxField } from '@/utils/form/checkbox-input/checkbox-field';

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
	additional: { gameId, gameData },
}: ModalContentsProps<
	boolean,
	{
		gameId: string;
		gameData: GameDetails;
	}
>) {
	const createInvite = useCreateInvite(gameId);
	const form = useForm({
		schema: CreateInviteForm,
		defaultValue: { uses: -1, role: '' },
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
				<ModalDialogLayout.Title>Create Invite</ModalDialogLayout.Title>

				<Fieldset>
					<Field>
						<Field.Label>Role</Field.Label>
						<Field.Contents>
							<SelectInput
								items={gameData.typeInfo.userRoles}
								valueSelector={(gt) => gt}
								{...form.fields.role.standardProps}
							>
								{(gt) => <>{gt}</> /* TODO: translate */}
							</SelectInput>
							<ErrorsList
								errors={form.fields.role.errors}
								prefix="CreateInvite.role"
							/>
						</Field.Contents>
					</Field>
					<CheckboxField {...form.fields.isUnlimited.standardProps}>
						<CheckboxField.Label>Unlimited Uses</CheckboxField.Label>
						<CheckboxField.Contents>
							<ErrorsList
								errors={form.fields.isUnlimited.errors}
								prefix="CreateInvite.isUnlimited"
							/>
						</CheckboxField.Contents>
					</CheckboxField>
					<NumberOfUses field={form.fields.uses} disabled={disableUsesAtom} />
				</Fieldset>

				<ModalDialogLayout.Buttons>
					<Button.Save type="submit">Create</Button.Save>
					<Button.Secondary onClick={() => reject('Cancel')}>
						Cancel
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
	field: UseFieldResult<number, string, 'hasErrors'>;
}) {
	const disabled = useAtomValue(disabledAtom);
	return (
		<Field>
			<Field.Label className={disabled ? 'text-gray-500' : ''}>
				Uses
			</Field.Label>
			<Field.Contents>
				<TextInput disabled={disabled} {...field.standardProps} />
				<ErrorsList errors={field.errors} prefix="CreateInvite.uses" />
			</Field.Contents>
		</Field>
	);
}
