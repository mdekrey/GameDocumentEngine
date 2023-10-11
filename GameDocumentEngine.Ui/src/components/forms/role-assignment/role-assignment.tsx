import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/button/button';
import { ButtonRow } from '@/components/button/button-row';
import { updateFormDefault } from '@/utils/form/update-form-default';
import { useForm } from '@/utils/form/useForm';
import { queries } from '@/utils/api/queries';
import { useRealtimeApi } from '@/utils/api/realtime-api';
import { defaultField } from '@/utils/form/fieldStateTracking';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { useTranslation } from 'react-i18next';
import { RoleAssignmentField } from './role-assignment-field';

export const UserRoleAssignment = z.object({}).catchall(z.string());

export type RoleAssignmentProps = {
	userRoles: { [id: string]: string };
	playerNames: { [id: string]: string };
	roles: string[];
	defaultRole?: string;
	onSaveRoles: (
		roles: z.infer<typeof UserRoleAssignment>,
	) => void | Promise<void>;
	roleTranslationsNamespace: string;
	translations: (key: string) => string;
	allowUpdate: boolean;
	allowUpdateSelf?: boolean;
};

export function RoleAssignment({
	userRoles,
	playerNames,
	roles,
	defaultRole,
	onSaveRoles,
	roleTranslationsNamespace,
	allowUpdate,
	allowUpdateSelf,
	translations: t,
}: RoleAssignmentProps) {
	const userResult = useQuery(queries.getCurrentUser(useRealtimeApi()));
	const { t: roleTranslations } = useTranslation(roleTranslationsNamespace, {
		keyPrefix: 'document',
	});

	const formData =
		defaultRole !== undefined
			? Object.fromEntries(
					Object.entries(playerNames).map(
						([key]) => [key, userRoles[key] ?? defaultRole] as const,
					),
			  )
			: userRoles;
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
	if (userResult.data?.id) {
		form.store.set(form.readOnlyFields, (prev) => {
			if (!allowUpdate) return true;
			if (allowUpdateSelf) return false;
			if (typeof prev === 'object' && prev[userResult.data.id]) return prev;
			return {
				[userResult.data.id]: true,
				[defaultField]: false,
			};
		});
	}

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<Fieldset>
				<RoleAssignmentField
					fields={form.fields.row}
					players={playerNames}
					roles={roles}
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
