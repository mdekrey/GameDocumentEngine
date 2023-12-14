import { HiQuestionMarkCircle } from 'react-icons/hi2';
import {
	type IGameObjectType,
	type GameObjectWidgetDefinition,
} from './defineDocument';
import { z } from 'zod';

export const missingDocumentTypeName = 'missing-document';
export const missingWidgetTypeName = 'missing-widget';

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

export const defaultMissingWidgetDefinition: GameObjectWidgetDefinition<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	void
> = {
	defaults: { width: 1, height: 1 },
	component: () => <></>,
	translationKeyPrefix: '',
	getConstraints: function () {
		return { min: { width: 1, height: 1 } };
	},
	settings: null,
};
