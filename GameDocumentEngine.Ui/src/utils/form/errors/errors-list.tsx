import { ErrorsAtom } from '@/utils/form/useField';
import { useAtomValue } from 'jotai';
import { HiX } from 'react-icons/hi';

export function ErrorsList({
	errors,
	prefix,
	translations: t,
}: {
	errors: ErrorsAtom<unknown>;
	// TODO: require translation function and remove prefix
	translations?: (key: string) => string;
	prefix?: string;
}) {
	const errorsValue = useAtomValue(errors);
	if (errorsValue.state !== 'hasData' || !errorsValue.data) return null;
	return (
		<ul className="text-red-800 font-bold text-xs">
			{errorsValue.data.issues.map((issue, key) => (
				<li key={key}>
					<HiX class="inline-block mb-1 mr-1" />
					{t?.(
						[
							...(prefix ? [prefix] : []),
							'errors',
							...issue.path,
							issue.code,
						].join('.'),
					)}
				</li>
			))}
		</ul>
	);
}
