import { SelectField } from '@/components/form-fields/select-input/select-field';
import type { FormFieldReturnType } from '@/utils/form';

type RoleAssignmentProps = {
	fields: (userId: string) => FormFieldReturnType<string>;
	players: { [userId: string]: { name: string } };
	roles: string[];
	translation: (key: string) => string;
};

export function RoleAssignmentField({
	fields,
	players,
	roles,
	translation,
}: RoleAssignmentProps) {
	return Object.entries(players).map(([k, playerSummary]) => {
		const field = fields(k);
		return (
			<SelectField
				key={k}
				field={field}
				labelContents={playerSummary.name}
				items={roles}
			>
				{(roleKey) =>
					roleKey ? (
						<>{translation(`roles.${roleKey}.name`)}</>
					) : (
						<>{translation('roles.no-role.name')}</>
					)
				}
			</SelectField>
		);
	});
}
