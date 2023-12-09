import type { ModalContentsProps } from '@/utils/modal/modal-service';
import { useTranslation } from 'react-i18next';
import { ModalDialogLayout } from '@/utils/modal/modal-dialog';
import { Prose } from '@/components/text/common';
import { Button } from '@/components/button/button';
import { useForm } from '@principlestudios/react-jotai-forms';
import { z } from 'zod';
import { useGameType } from '@/apps/documents/useGameType';
import { useQuery } from '@tanstack/react-query';
import { queries } from '@/utils/api/queries';

type NewWidgetResult = {
	id: string;
	settings: Record<string, unknown>;
	defaults: {
		width: number;
		height: number;
	};
};
const newWidgetSchema = z.object({
	id: z.string().min(1),
});

export function AddWidgetModal({
	resolve,
	reject,
	additional: { gameId, id },
}: ModalContentsProps<NewWidgetResult, { gameId: string; id: string }>) {
	const { t } = useTranslation('doc-types:Dashboard', {
		keyPrefix: 'add-widget-modal',
	});
	const form = useForm({
		defaultValue: { id: '' },
		schema: newWidgetSchema,
		translation: t,
		fields: {
			id: ['id'],
		},
	});
	const gameType = useGameType(gameId);
	const droppingDoc = useQuery(queries.getDocument(gameId, id));

	const key =
		droppingDoc.data?.type &&
		gameType.data?.objectTypes[droppingDoc.data?.type]?.key;
	const { t: objT } = useTranslation(`doc-types:${key ?? 'unknown'}`);

	if (!gameType.isSuccess || !droppingDoc.isSuccess) return null;

	const dropped = droppingDoc.data;
	const objScripts = gameType.data.objectTypes[droppingDoc.data.type];
	const {
		typeInfo: { icon: Icon, widgets },
	} = objScripts;

	const widgetKeys = widgets ? Object.keys(widgets) : [];

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<ModalDialogLayout>
				<ModalDialogLayout.Title>{t('title')}</ModalDialogLayout.Title>
				<Icon /> {dropped.name} {objT('name')}
				<Prose>{t('intro')}</Prose>
				{widgetKeys.join(', ')}
				<ModalDialogLayout.Buttons>
					<Button.Save type="submit">{t('submit')}</Button.Save>
					<Button.Secondary onClick={() => reject('Cancel')}>
						{t('cancel')}
					</Button.Secondary>
				</ModalDialogLayout.Buttons>
			</ModalDialogLayout>
		</form>
	);

	function onSubmit({ id }: z.infer<typeof newWidgetSchema>) {
		const { width, height, settings } =
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			objScripts.typeInfo.widgets![id].defaults;
		resolve({
			id,
			defaults: { width, height },
			settings,
		});
	}
}
