import { type CreateGameDetails } from '@/api/models/CreateGameDetails';
import { Button } from '@/components/button/button';
import { ButtonRow } from '@/components/button/button-row';
import { queries } from '@/utils/api/queries';
import { Fieldset } from '@/components/form-fields/fieldset/fieldset';
import { TextField } from '@/components/form-fields/text-input/text-field';
import {
	NotSelected,
	SelectField,
} from '@/components/form-fields/select-input/select-field';
import { useForm } from '@/utils/form';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { ZodType } from 'zod';
import { z } from 'zod';
import { Section, SingleColumnSections } from '@/components/sections';

function useCreateGame() {
	const navigate = useNavigate();
	return useMutation(queries.createGame(navigate));
}

const CreateGameDetails = z.object({
	name: z.string().nonempty(),
	type: z.string().nonempty(),
}) satisfies ZodType<CreateGameDetails>;

export function CreateGame() {
	const { t } = useTranslation(['create-game']);
	const gameForm = useForm({
		defaultValue: { name: '', type: '' },
		schema: CreateGameDetails,
		translation: t,
	});

	const gameTypes = useSuspenseQuery(queries.listGameTypes()).data;
	const createGame = useCreateGame();

	return (
		<SingleColumnSections>
			<Section>
				<form onSubmit={gameForm.handleSubmit(onSubmit)}>
					<Fieldset>
						<TextField field={gameForm.field(['name'])} />
						<SelectField
							field={gameForm.field(['type'])}
							items={Object.keys(gameTypes)}
						>
							{(gt) =>
								gt ? (
									<Trans
										ns={gameTypes[gt].translationNamespace}
										i18nKey={'name'}
									/>
								) : (
									<NotSelected>
										{gameForm.field(['type']).translation('not-selected')}
									</NotSelected>
								)
							}
						</SelectField>
						{/* TODO: invite users from other games? */}
						<ButtonRow>
							<Button type="submit">{t('submit')}</Button>
						</ButtonRow>
					</Fieldset>
				</form>
			</Section>
		</SingleColumnSections>
	);

	function onSubmit(currentValue: z.infer<typeof CreateGameDetails>) {
		createGame.mutate(currentValue);
	}
}
