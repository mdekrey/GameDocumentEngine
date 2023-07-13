import { ErrorsAtom } from '@/utils/form/useField';
import { useAtomValue } from 'jotai';
import { HiX } from 'react-icons/hi';

export function ErrorsList({
	errors,
	prefix,
}: {
	errors: ErrorsAtom<unknown>;
	prefix: string;
}) {
	const errorsValue = useAtomValue(errors);
	if (errorsValue.state !== 'hasData' || !errorsValue.data) return null;
	return (
		<ul className="text-red-800 font-bold text-xs">
			{errorsValue.data.issues.map((issue, key) => (
				<li key={key}>
					<HiX class="inline-block mb-1 mr-1" />
					{[prefix, ...issue.path, issue.code].join('.')}
				</li>
			))}
		</ul>
	);
}
