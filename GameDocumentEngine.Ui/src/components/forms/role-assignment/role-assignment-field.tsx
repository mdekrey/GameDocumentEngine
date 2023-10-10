import { ErrorsList } from '@/components/form-fields/errors/errors-list';
import { Field } from '@/components/form-fields/field/field';
import { SelectInput } from '@/components/form-fields/select-input/select-input';
import type { FormFieldReturnType } from '@/utils/form/useForm';

type RoleAssignemntProps = {
	fields: (userId: string) => FormFieldReturnType<string>;
	players: { [userId: string]: string };
	roles: string[];
	translations: (key: string) => string;
};

export function RoleAssignmentField({
	fields,
	players,
	roles,
	translations: t,
}: RoleAssignemntProps) {
	return Object.entries(players).map(([k, name]) => {
		const field = fields(k);
		return (
			<Field key={k}>
				<Field.Label>{name}</Field.Label>

				<Field.Contents>
					<SelectInput {...field.htmlProps.asControlled()} items={roles}>
						{(roleKey) =>
							roleKey ? (
								<>{t(`roles.${roleKey}.name`)}</>
							) : (
								<>{t('roles.no-role.name')}</>
							)
						}
					</SelectInput>
					<ErrorsList errors={field.errors} translations={field.translation} />
				</Field.Contents>
			</Field>
		);
	});
}
