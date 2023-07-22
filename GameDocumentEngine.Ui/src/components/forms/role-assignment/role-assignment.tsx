import { UserRoleAssignmentValue } from '@/api/models/UserRoleAssignmentValue';
import { Button } from '@/components/button/button';
import { ButtonRow } from '@/components/button/button-row';
import { ErrorsList } from '@/utils/form/errors/errors-list';
import { Field } from '@/utils/form/field/field';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { SelectInput } from '@/utils/form/select-input/select-input';
import { useForm } from '@/utils/form/useForm';
import { z } from 'zod';

export const UserRoleAssignment = z.object({}).catchall(z.string());

export type RoleAssignmentProps = {
	currentAssignments: { [id: string]: UserRoleAssignmentValue };
	roles: string[];
	onSaveRoles: (
		roles: z.infer<typeof UserRoleAssignment>,
	) => void | Promise<void>;
};

export function RoleAssignment({
	currentAssignments,
	roles,
	onSaveRoles,
}: RoleAssignmentProps) {
	const form = useForm({
		defaultValue: Object.fromEntries(
			Object.entries(currentAssignments).map(([k, v]) => [k, v.role]),
		),
		schema: UserRoleAssignment,
		fields: {
			row: (userId: string) => [userId] as const,
		},
	});

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<Fieldset className="m-0">
				{Object.entries(currentAssignments).map(([k, v]) => (
					<Field key={k}>
						<Field.Label>{v.name}</Field.Label>

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
