import { Button } from '@/components/button/button';
import { Field } from '@/utils/form/field/field';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { api, currentUserQuery } from '@/utils/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { produceWithPatches } from 'immer';
import type { Patch } from 'rfc6902';
import { UseFieldResult } from '@/utils/form/useField';
import { immerPatchToStandard } from '@/utils/api/immerPatchToStandard';
import { z } from 'zod';
import { ErrorsList } from '../../utils/form/errors/errors-list';
import { TextInput } from '@/utils/form/text-input/text-input';
import { useForm } from '@/utils/form/useForm';
import { UserDetails } from '@/api/models/UserDetails';
import { ButtonRow } from '@/components/button/button-row';
import { NarrowContent } from '@/utils/containers/narrow-content';

function usePatchUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (changes: Patch) => {
			const response = await api.patchUser({ body: changes });
			if (response.statusCode === 200) return response;
			else if (response.statusCode === 409)
				throw new Error(
					'Other changes were being applied at the same time. Try again later.',
				);
			else throw new Error('Could not save changes');
		},
		onSuccess: (response) => {
			queryClient.setQueryData(currentUserQuery().queryKey, response);
		},
		onError: () => queryClient.invalidateQueries(currentUserQuery().queryKey),
	});
}

export function ProfileFields({ name }: { name: UseFieldResult<string> }) {
	return (
		<Fieldset>
			<Field>
				<Field.Label>Name</Field.Label>
				<Field.Contents>
					<TextInput {...name.standardProps} />
					<ErrorsList errors={name.errors} prefix="UserDetail.name" />
				</Field.Contents>
			</Field>
			<ButtonRow>
				<Button type="submit">Save Changes</Button>
			</ButtonRow>
		</Fieldset>
	);
}

const UserDetails = z.object({
	name: z.string().min(3),
});

export function Profile() {
	const userForm = useForm({
		defaultValue: { name: '' },
		schema: UserDetails,
		fields: {
			name: ['name'],
		},
	});

	const userQueryResult = useQuery(currentUserQuery());
	const saveUser = usePatchUser();

	if (!userQueryResult.isSuccess) {
		if (userQueryResult.isLoadingError) {
			return 'Failed to load';
		}
		return 'Loading';
	} else if (!saveUser.isLoading) {
		userForm.fields.name.setValue(userQueryResult.data.data.name);
	}

	const userData = userQueryResult.data.data;

	return (
		<NarrowContent>
			<form onSubmit={userForm.handleSubmit(onSubmit)}>
				<ProfileFields {...userForm.fields} />
				<ErrorsList errors={userForm.errors} prefix="UserDetails" />
			</form>
		</NarrowContent>
	);

	function onSubmit(currentValue: z.infer<typeof UserDetails>) {
		const patches = produceWithPatches(userData, (draft) => {
			draft.name = currentValue.name;
		})[1];
		if (patches.length > 0) saveUser.mutate(patches.map(immerPatchToStandard));
	}
}
