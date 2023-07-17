import { Button } from '@/components/button/button';
import { ErrorsList } from '@/utils/form/errors/errors-list';
import { Field } from '@/utils/form/field/field';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { TextInput } from '@/utils/form/text-input/text-input';
import { useForm } from '@/utils/form/useForm';
import { ModalAlertLayout } from '@/utils/modal/alert-layout';
import { ModalContentsProps } from '@/utils/modal/modal-service';
import { useMemo } from 'react';
import { z } from 'zod';

export function DeleteGameModal({
	resolve,
	reject,
	additional: { name: originalName },
}: ModalContentsProps<boolean, { name: string }>) {
	const DeleteGame = useMemo(
		() =>
			z.object({
				name: z
					.string()
					.refinement((name) => name === originalName, { code: 'custom' }),
			}),
		[originalName],
	);
	const form = useForm({
		schema: DeleteGame,
		defaultValue: { name: '' },
		fields: { name: ['name'] },
	});

	return (
		<form className="w-full h-full" onSubmit={form.handleSubmit(onSubmit)}>
			<ModalAlertLayout>
				<ModalAlertLayout.Title>Delete game</ModalAlertLayout.Title>
				<p className="text-sm text-gray-500">
					Are you sure you want to delete the game called{' '}
					<span className="font-bold">{originalName}</span>? All of your game
					data will be permanently removed. This action cannot be undone.
				</p>
				<p className="text-sm text-gray-500">
					Please type the name of the game below to confirm deletion.
				</p>
				<Fieldset className="m-0">
					<Field>
						<Field.Label>Name</Field.Label>

						<Field.Contents>
							<TextInput {...form.fields.name.standardProps} />
							<ErrorsList
								errors={form.fields.name.errors}
								prefix="DeleteGame.name"
							/>
						</Field.Contents>
					</Field>
				</Fieldset>
				<ModalAlertLayout.Buttons>
					<Button.Destructive type="submit">Delete</Button.Destructive>
					<Button.Secondary onClick={() => reject('Cancel')}>
						Cancel
					</Button.Secondary>
				</ModalAlertLayout.Buttons>
			</ModalAlertLayout>
		</form>
	);

	function onSubmit() {
		resolve(true);
	}
}
