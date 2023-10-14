import { Button } from '@/components/button/button';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { queries } from '@/utils/api/queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { produceWithPatches } from 'immer';
import type { UseFieldResult } from '@/utils/form';
import { immerPatchToStandard } from '@/utils/api/immerPatchToStandard';
import { z } from 'zod';
import { useForm } from '@/utils/form';
import { type UserDetails } from '@/api/models/UserDetails';
import { ButtonRow } from '@/components/button/button-row';
import { updateFormDefault } from '@/utils/form';
import { useTranslation } from 'react-i18next';
import { TextField } from '@/components/form-fields/text-input/text-field';
import { SingleColumnSections } from '@/components/sections';
import { useRealtimeApi } from '@/utils/api/realtime-api';

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
	const { t } = useTranslation(['profile']);
	const userForm = useForm({
		defaultValue: { name: '' },
		schema: UserDetails,
		translation: t,
		fields: {
			name: ['name'],
		},
	});

	const realtimeApi = useRealtimeApi();
	const userQueryResult = useQuery(queries.getCurrentUser(realtimeApi));
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
		<SingleColumnSections>
			<form onSubmit={userForm.handleSubmit(onSubmit)}>
				<ProfileFields {...userForm.fields} />
			</form>
		</SingleColumnSections>
	);

	function onSubmit(currentValue: z.infer<typeof UserDetails>) {
		const patches = produceWithPatches(userData, (draft) => {
			draft.name = currentValue.name;
		})[1];
		if (patches.length > 0) saveUser.mutate(patches.map(immerPatchToStandard));
	}
}
