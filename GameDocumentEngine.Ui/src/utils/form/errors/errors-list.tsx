import { ErrorsAtom } from '@/utils/form/useField';
import { useAtomValue } from 'jotai';

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
		<ul className="text-red-800 font-bold list-disc ml-8">
			{errorsValue.data.issues.map((issue, key) => (
				<li key={key}>
					{[prefix, ...issue.path].join('.')}.{issue.code}
				</li>
			))}
		</ul>
	);
}
