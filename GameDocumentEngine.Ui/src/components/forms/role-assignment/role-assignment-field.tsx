import { ErrorsList } from '@/components/form-fields/errors/errors-list';
import { Field } from '@/components/form-fields/field/field';
import { SelectInput } from '@/components/form-fields/select-input/select-input';
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
			<Field key={k}>
				<Field.Label>{playerSummary.name}</Field.Label>

				<Field.Contents>
					<SelectInput {...field.htmlProps.asControlled()} items={roles}>
						{(roleKey) =>
							roleKey ? (
								<>{translation(`roles.${roleKey}.name`)}</>
							) : (
								<>{translation('roles.no-role.name')}</>
							)
						}
					</SelectInput>
					<ErrorsList errors={field.errors} translations={field.translation} />
				</Field.Contents>
			</Field>
		);
	});
}
