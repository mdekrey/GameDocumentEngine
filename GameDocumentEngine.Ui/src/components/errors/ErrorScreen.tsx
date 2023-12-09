import { IntroText, Prose } from '@/components/text/common';
import { HiXCircle } from 'react-icons/hi2';

export function ErrorScreen({
	message,
	explanation,
}: {
	message: string;
	explanation?: string;
}) {
	return (
		<div className="w-full h-full flex flex-col items-center px-4">
			<div className="flex-1" />
			<IntroText className="text-red-800 dark:text-red-200">
				<HiXCircle className="inline-block" /> {message}
			</IntroText>
			{explanation && <Prose className="my-4 max-w-lg">{explanation}</Prose>}
			<div className="flex-[2]" />
		</div>
	);
}
