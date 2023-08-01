import { Button } from '@/components/button/button';
import { ButtonRow } from '@/components/button/button-row';
import { ErrorsList } from '@/utils/form-fields/jotai/errors/errors-list';
import { Field } from '@/utils/form-fields/field/field';
import { Fieldset } from '@/utils/form-fields/fieldset/fieldset';
import { SelectInput } from '@/utils/form-fields/select-input/select-input';
import { updateFormDefault } from '@/utils/form/update-form-default';
import { useForm } from '@/utils/form/useForm';
import { z } from 'zod';

export const UserRoleAssignment = z.object({}).catchall(z.string());

export type RoleAssignmentProps = {
	permissions: { [id: string]: string };
	playerNames: { [id: string]: string };
	roles: string[];
	defaultRole?: string;
	onSaveRoles: (
		roles: z.infer<typeof UserRoleAssignment>,
	) => void | Promise<void>;
	roleTranslations: (key: string) => string;
	translations: (key: string) => string;
};

export function RoleAssignment({
	permissions,
	playerNames,
	roles,
	defaultRole,
	onSaveRoles,
	roleTranslations,
	translations: t,
}: RoleAssignmentProps) {
	const formData =
		defaultRole !== undefined
			? Object.fromEntries(
					Object.entries(playerNames).map(
						([key]) => [key, permissions[key] ?? defaultRole] as const,
					),
			  )
			: permissions;
	const form = useForm({
		defaultValue: formData,
		schema: UserRoleAssignment,
		translation: t,
		fields: {
			row: (userId: string) => [userId] as const,
		},
	});
	updateFormDefault(form, formData);

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<Fieldset className="m-0">
				{Object.entries(playerNames).map(([k, name]) => {
					const field = form.fields.row(k);
					return (
						<Field key={k}>
							<Field.Label>{name}</Field.Label>

							<Field.Contents>
								<SelectInput
									{...field.htmlProps()}
									items={roles}
									valueSelector={(gt) => gt}
								>
									{(gt) =>
										gt ? (
											<>{roleTranslations(`roles.${gt}.name`)}</>
										) : (
											<>{t('no-role')}</>
										)
									}
								</SelectInput>
								<ErrorsList
									errors={field.errors}
									translations={field.translation}
								/>
							</Field.Contents>
						</Field>
					);
				})}
				<ButtonRow>
					<Button type="submit">{t('submit')}</Button>
				</ButtonRow>
			</Fieldset>
		</form>
	);

	function onSubmit(roleAssignments: z.infer<typeof UserRoleAssignment>) {
		void onSaveRoles(roleAssignments);
	}
}
