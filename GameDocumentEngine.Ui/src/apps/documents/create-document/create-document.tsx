import { CreateDocumentDetails } from '@/api/models/CreateDocumentDetails';
import { GameObjectTypeDetails } from '@/api/models/GameObjectTypeDetails';
import { GameTypeDetails } from '@/api/models/GameTypeDetails';
import { Button } from '@/components/button/button';
import { ButtonRow } from '@/components/button/button-row';
import type { IGameObjectType } from '@/documents/defineDocument';
import { queries } from '@/utils/api/queries';
import { NarrowContent } from '@/utils/containers/narrow-content';
import { ErrorsList } from '@/utils/form/errors/errors-list';
import { Field } from '@/utils/form/field/field';
import { Fieldset } from '@/utils/form/fieldset/fieldset';
import { SelectInput } from '@/utils/form/select-input/select-input';
import { TextInput } from '@/utils/form/text-input/text-input';
import { useForm, FormOptions } from '@/utils/form/useForm';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Loadable } from 'node_modules/jotai/vanilla/utils/loadable';
import { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZodType, z } from 'zod';

type GameType = Record<string, Promise<GameObjectType>>;

type GameObjectType = {
	typeInfo: IGameObjectType;
};

class GameTypeService {
	private readonly gameTypes = new Map<string, GameType>();
	private readonly objectTypes = new Map<string, Promise<GameObjectType>>();

	ensureLoaded(typeInfo: GameTypeDetails) {
		let result = this.gameTypes.get(typeInfo.name);
		if (!result) {
			result = Object.fromEntries(
				typeInfo.objectTypes.map(
					(objectType) =>
						[objectType.name, this.getOrLoadObjectType(objectType)] as const,
				),
			) as GameType;
			this.gameTypes.set(typeInfo.name, result);
		}

		return result;
	}

	private getOrLoadObjectType(
		objectType: GameObjectTypeDetails,
	): Promise<GameObjectType> {
		let result = this.objectTypes.get(objectType.name);
		if (!result) {
			result = this.loadObjectType(objectType);
			this.objectTypes.set(objectType.name, result);
		}
		return result;
	}

	private async loadObjectType(
		objectType: GameObjectTypeDetails,
	): Promise<GameObjectType> {
		await Promise.all(
			objectType.scripts.map(
				(src) =>
					new Promise((resolve, reject) => {
						try {
							const tag = document.createElement('script');
							const container = document.head || document.body;

							tag.type = 'module';
							tag.crossOrigin = 'true';
							tag.src = src;

							tag.addEventListener('load', () => {
								resolve({ loaded: true, error: false });
							});

							tag.addEventListener('error', () => {
								reject({
									loaded: false,
									error: true,
									message: `Failed to load script with src ${src}`,
								});
							});

							container.appendChild(tag);
						} catch (error) {
							reject(error);
						}
					}),
			),
		);

		return {
			typeInfo: window.widgets[objectType.name],
		};
	}
}

const gameTypeServiceContext = createContext<GameTypeService>(
	new GameTypeService(),
);

function useGameType(gameId: string): Loadable<GameType> {
	const game = useQuery(queries.getGameDetails(gameId));
	const gameTypeService = useContext(gameTypeServiceContext);

	if (game.isSuccess) {
		return {
			state: 'hasData',
			data: gameTypeService.ensureLoaded(game.data.typeInfo),
		};
	} else if (game.isError) {
		return { state: 'hasError', error: game.error };
	}
	return { state: 'loading' };
}

function useCreateDocument(gameId: string) {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	return useMutation(queries.createDocument(queryClient, navigate, gameId));
}

const CreateDocumentDetails = z.object({
	name: z.string().min(3),
	type: z.string().nonempty(),
}) satisfies ZodType<Omit<CreateDocumentDetails, 'details'>>;

const createDocumentForm = {
	defaultValue: { name: '', type: '' },
	schema: CreateDocumentDetails,
	fields: {
		name: ['name'],
		type: ['type'],
	},
} as const satisfies FormOptions<Omit<CreateDocumentDetails, 'details'>>;

export function CreateDocument({ gameId }: { gameId: string }) {
	const gameForm = useForm(createDocumentForm);

	const gameType = useGameType(gameId);

	const createDocument = useCreateDocument(gameId);

	return (
		<NarrowContent>
			<form onSubmit={gameForm.handleSubmit(onSubmit)}>
				<Fieldset>
					<Field>
						<Field.Label>Name</Field.Label>
						<Field.Contents>
							<TextInput {...gameForm.fields.name.standardProps} />
							<ErrorsList
								errors={gameForm.fields.name.errors}
								prefix="CreateGameDetails.name"
							/>
						</Field.Contents>
					</Field>
					<Field>
						<Field.Label>Type</Field.Label>
						<Field.Contents>
							{gameType.state === 'hasData' ? (
								<SelectInput
									items={Object.keys(gameType.data)}
									valueSelector={(gt) => gt}
									{...gameForm.fields.type.standardProps}
								>
									{(gt) => <span className="font-bold">{gt}</span>}
								</SelectInput>
							) : null}
							<ErrorsList
								errors={gameForm.fields.type.errors}
								prefix="CreateGameDetails.type"
							/>
						</Field.Contents>
					</Field>
					<ButtonRow>
						<Button type="submit">Create</Button>
					</ButtonRow>
				</Fieldset>
			</form>
		</NarrowContent>
	);

	async function onSubmit(
		currentValue: Omit<CreateDocumentDetails, 'details'>,
	) {
		if (gameType.state !== 'hasData') return; // shouldn't have gotten here
		const objectInfo = await gameType.data[currentValue.type];

		createDocument.mutate({
			document: { ...currentValue, details: objectInfo.typeInfo.template },
		});
	}
}
