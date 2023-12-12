import type { GameObjectComponentBase } from '@/documents/defineDocument';
import { NamedIcon } from './NamedIcon';

export function NamedIconWidget({
	document,
	docType,
	translation: t, // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: GameObjectComponentBase<any>) {
	return (
		<div className="h-full text-xl font-bold flex flex-row items-center">
			<NamedIcon
				icon={docType.typeInfo.icon}
				name={document.name}
				typeName={t('name')}
			/>
		</div>
	);
}
