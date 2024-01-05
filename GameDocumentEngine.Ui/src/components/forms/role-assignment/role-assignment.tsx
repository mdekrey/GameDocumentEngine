import { z } from 'zod';
import { Button } from '@/components/button/button';
import { ButtonRow } from '@/components/button/button-row';
import { updateFormDefault } from '@/utils/form';
import { useForm } from '@/utils/form';
import { defaultField } from '@/utils/form';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { useTranslation } from 'react-i18next';
import { RoleAssignmentField } from './role-assignment-field';
import { useCurrentUser } from '@/utils/api/hooks';
import type { PlayerSummary } from '@/api/models/PlayerSummary';

export const UserRoleAssignment = z.record(z.string());

export type RoleAssignmentProps = {
	getPlayerRole: (playerId: string) => string | undefined;
	players: { [id: string]: PlayerSummary };
	roles: string[];
	defaultRole?: string;
	onSaveRoles: (
		roles: z.infer<typeof UserRoleAssignment>,
	) => void | Promise<void>;
	roleTranslationsNamespace: string | undefined;
	translations: (key: string) => string;
	allowUpdate: boolean;
	allowUpdateSelf?: boolean;
};

export function RoleAssignment({
	getPlayerRole,
	players,
	roles,
	defaultRole,
	onSaveRoles,
	roleTranslationsNamespace,
	allowUpdate,
	allowUpdateSelf,
	translations: t,
}: RoleAssignmentProps) {
	const user = useCurrentUser();
	const { t: roleTranslations } = useTranslation(roleTranslationsNamespace);

	const formData = Object.fromEntries(
		Object.entries(players)
			.map(([key]) => [key, getPlayerRole(key) ?? defaultRole] as const)
			.filter((kvp): kvp is [string, string] => kvp[1] !== undefined),
	);
	const form = useForm({
		defaultValue: formData,
		schema: UserRoleAssignment,
		translation: roleTranslations,
		fields: {
			row: (userId: string) => ({
				path: [userId] as const,
				translationPath: [],
			}),
		},
		readOnly: !allowUpdate,
	});
	updateFormDefault(form, formData);
	form.store.set(form.readOnlyFields, (prev) => {
		if (!allowUpdate) return true;
		if (allowUpdateSelf) return false;
		if (typeof prev === 'object' && prev[user.id]) return prev;
		return {
			[user.id]: true,
			[defaultField]: false,
		};
	});

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<Fieldset>
				<RoleAssignmentField
					fields={form.fields.row}
					players={players}
					roles={roles}
					translation={roleTranslations}
				/>
				{allowUpdate && (
					<ButtonRow>
						<Button type="submit">{t('submit')}</Button>
					</ButtonRow>
				)}
			</Fieldset>
		</form>
	);

	function onSubmit(roleAssignments: z.infer<typeof UserRoleAssignment>) {
		void onSaveRoles(roleAssignments);
	}
}
