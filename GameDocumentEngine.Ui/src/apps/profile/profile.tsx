import { Button } from '@/components/button/button';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { queries } from '@/utils/api/queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { produceWithPatches } from 'immer';
import { UseFieldResult } from '@/utils/form/useField';
import { immerPatchToStandard } from '@/utils/api/immerPatchToStandard';
import { z } from 'zod';
import { ErrorsList } from '@/components/form-fields/errors/errors-list';
import { useForm } from '@/utils/form/useForm';
import { UserDetails } from '@/api/models/UserDetails';
import { ButtonRow } from '@/components/button/button-row';
import { updateFormDefault } from '@/utils/form/update-form-default';
import { useTranslation } from 'react-i18next';
import { TextField } from '@/components/form-fields/text-input/text-field';

function usePatchUser() {
	const queryClient = useQueryClient();
	return useMutation(queries.patchUser(queryClient));
}

export function ProfileFields({ name }: { name: UseFieldResult<string> }) {
	const { t } = useTranslation(['profile']);
	return (
		<Fieldset>
			<TextField field={name} />
			<ButtonRow>
				<Button type="submit">{t('submit')}</Button>
			</ButtonRow>
		</Fieldset>
	);
}

const UserDetails = z.object({
	name: z.string().min(3),
});

export function Profile() {
	const { t, i18n } = useTranslation(['profile']);
	const userForm = useForm({
		defaultValue: { name: '' },
		schema: UserDetails,
		translation: t,
		fields: {
			name: ['name'],
		},
	});

	const userQueryResult = useQuery(queries.getCurrentUser);
	const saveUser = usePatchUser();

	if (!userQueryResult.isSuccess) {
		if (userQueryResult.isLoadingError) {
			return 'Failed to load';
		}
		return 'Loading';
	}
	const userData = userQueryResult.data;
	updateFormDefault(userForm, userData);

	return (
		<>
			<form onSubmit={userForm.handleSubmit(onSubmit)}>
				<ProfileFields {...userForm.fields} />
				<ErrorsList
					errors={userForm.errors}
					translations={i18n.getFixedT(null, 'profile', 'fields')}
				/>
			</form>
		</>
	);

	function onSubmit(currentValue: z.infer<typeof UserDetails>) {
		const patches = produceWithPatches(userData, (draft) => {
			draft.name = currentValue.name;
		})[1];
		if (patches.length > 0) saveUser.mutate(patches.map(immerPatchToStandard));
	}
}
