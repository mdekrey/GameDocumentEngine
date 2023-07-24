/* eslint-disable i18next/no-literal-string */
import { Button } from '@/components/button/button';
import { ButtonRow } from '@/components/button/button-row';
import { ErrorsList } from '@/utils/form/errors/errors-list';
import { Field } from '@/utils/form/field/field';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { SelectInput } from '@/utils/form/select-input/select-input';
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
};

export function RoleAssignment({
	permissions,
	playerNames,
	roles,
	defaultRole,
	onSaveRoles,
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
		fields: {
			row: (userId: string) => [userId] as const,
		},
	});
	updateFormDefault(form, formData);

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<Fieldset className="m-0">
				{Object.entries(playerNames).map(([k, name]) => (
					<Field key={k}>
						<Field.Label>{name}</Field.Label>

						<Field.Contents>
							<SelectInput
								{...form.fields.row(k).standardProps}
								items={roles}
								valueSelector={(gt) => gt}
							>
								{(gt) => <>{gt}</> /* TODO: translate */}
							</SelectInput>
							<ErrorsList
								errors={form.fields.row(k).errors}
								prefix="RoleAssignment.role" // TODO: prefix
							/>
						</Field.Contents>
					</Field>
				))}
				<ButtonRow>
					<Button type="submit">Save Changes</Button>
				</ButtonRow>
			</Fieldset>
		</form>
	);

	function onSubmit(roleAssignments: z.infer<typeof UserRoleAssignment>) {
		void onSaveRoles(roleAssignments);
	}
}
