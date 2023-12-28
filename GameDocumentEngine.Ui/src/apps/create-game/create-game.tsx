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
import { useMutation } from '@tanstack/react-query';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { ZodType } from 'zod';
import { z } from 'zod';
import { Section, SingleColumnSections } from '@/components/sections';
import { useAllGameTypes } from '@/utils/api/hooks';
import { getGameTypeTranslationNamespace } from '@/utils/api/accessors';

function useCreateGame() {
	const navigate = useNavigate();
	return useMutation(queries.createGame(navigate));
}

function useImportGame() {
	const navigate = useNavigate();
	return useMutation(queries.importGame(navigate));
}

const CreateGameDetails = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
}) satisfies ZodType<CreateGameDetails>;

export function CreateGame() {
	const { t } = useTranslation(['create-game']);
	const gameForm = useForm({
		defaultValue: { name: '', type: '' },
		schema: CreateGameDetails,
		translation: t,
	});

	const gameTypes = useAllGameTypes();
	const createGame = useCreateGame();
	const importGame = useImportGame();

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
										ns={getGameTypeTranslationNamespace(gt)}
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
							<div className="relative">
								<Button.Secondary>{t('import')}</Button.Secondary>
								<input
									type="file"
									className="absolute inset-0 opacity-0 cursor-pointer text-[0px]"
									accept=".vaultvtt"
									onChange={onFileSelected}
								/>
							</div>
						</ButtonRow>
					</Fieldset>
				</form>
			</Section>
		</SingleColumnSections>
	);

	function onSubmit(currentValue: z.infer<typeof CreateGameDetails>) {
		createGame.mutate(currentValue);
	}

	function onFileSelected(ev: React.ChangeEvent<HTMLInputElement>) {
		if (ev.target.files?.length !== 1) return;
		const file = ev.target.files[0];

		importGame.mutate({ file });
	}
}
