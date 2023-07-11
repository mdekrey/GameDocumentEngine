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
import { useForm, useFormField } from '@/utils/form/useForm';
import { UserDetails } from '@/api/models/UserDetails';

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

export function ProfileFields({
	name,
}: {
	name: UseFieldResult<string, string, 'hasErrors'>;
}) {
	return (
		<Fieldset>
			<Field>
				<Field.Label>Name</Field.Label>
				<Field.Contents>
					<TextInput {...name.standardProps} />
					<ErrorsList errors={name.errors} prefix="UserDetail.name" />
				</Field.Contents>
			</Field>
			<div className="col-span-2 flex flex-row-reverse gap-2">
				<Button type="submit">Save Changes</Button>
			</div>
		</Fieldset>
	);
}

const UserDetails = z.object({
	name: z.string().min(3),
});

export function ProfileForm() {
	const userForm = useForm<z.infer<typeof UserDetails>>({
		defaultValue: { name: '' },
		schema: UserDetails,
	});
	const name = useFormField(['name'], userForm);

	const userQueryResult = useQuery({ ...currentUserQuery() });
	const saveUser = usePatchUser();

	if (!userQueryResult.isSuccess) {
		if (userQueryResult.isLoadingError) {
			return 'Failed to load';
		}
		return 'Loading';
	} else if (!saveUser.isLoading) {
		name.setValue(userQueryResult.data.data.name);
	}

	return (
		<form onSubmit={submitForm}>
			<ProfileFields name={name} />
			<ErrorsList errors={userForm.errors} prefix="UserDetails" />
		</form>
	);

	function submitForm(ev: React.FormEvent<HTMLFormElement>) {
		ev.preventDefault();

		if (!userQueryResult.isSuccess) return;

		const [, patches] = produceWithPatches(
			userQueryResult.data.data,
			(draft) => {
				const currentValue = userForm.get();
				draft.name = currentValue.name;
			},
		);
		if (patches.length > 0) saveUser.mutate(patches.map(immerPatchToStandard));
	}
}
