import type { ErrorsAtom, FieldTranslation } from '@/utils/form/useField';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { HiX } from 'react-icons/hi';
import { AtomContents } from '../../jotai/atom-contents';

export function ErrorsList({
	errors,
	translations,
}: {
	errors: ErrorsAtom;
	translations: FieldTranslation;
}) {
	const errorsDispaly = useComputedAtom((get) => {
		const errorsValue = get(errors);
		if (errorsValue.state !== 'hasData' || !errorsValue.data) return null;
		return (
			<ul className="text-red-800 dark:text-red-500 font-bold text-xs">
				{errorsValue.data.issues.map((issue, key) => (
					<li key={key}>
						<HiX className="inline-block mb-1 mr-1" />
						{translations(['errors', issue.code])}
					</li>
				))}
			</ul>
		);
	});

	return <AtomContents>{errorsDispaly}</AtomContents>;
}
