import { HiQuestionMarkCircle } from 'react-icons/hi2';
import {
	type IGameObjectType,
	type GameObjectWidgetDefinition,
} from './defineDocument';
import { z } from 'zod';

export const missingDocumentType: IGameObjectType = {
	component: () => <></>,
	fixup: {
		fromForm(v) {
			return v;
		},
		toForm(v) {
			return v;
		},
	},
	icon: HiQuestionMarkCircle,
	schema: z.any(),
	template: null,
};

export const defaultMissingWidgetDefinition = {
	defaults: { width: 1, height: 1 },
	component: () => <></>,
	translationKeyPrefix: '',
	getConstraints: function () {
		return { min: { width: 1, height: 1 } };
	},
	settings: null,
	translationNamespace: undefined,
} satisfies GameObjectWidgetDefinition<unknown, void>;
