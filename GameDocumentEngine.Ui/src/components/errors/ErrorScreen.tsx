import { IntroText, Prose } from '@/components/text/common';
import { HiXCircle } from 'react-icons/hi2';
import { elementTemplate } from '../template';
import { useTranslation } from 'react-i18next';

type ErrorScreenProps = {
	message: string;
	explanation?: string;
};

const Flex1 = elementTemplate('Flex1', 'div', (T) => <T className="flex-1" />);
const Flex2 = elementTemplate('Flex1', 'div', (T) => (
	<T className="flex-[2]" />
));
const Centered = elementTemplate('Centered', 'div', (T) => (
	<T className="w-full h-full flex flex-col items-center" />
));

export function ErrorScreen({ message, explanation }: ErrorScreenProps) {
	return (
		<Centered className="px-4">
			<Flex1 />
			<IntroText className="text-red-800 dark:text-red-200">
				<HiXCircle className="inline-block" /> {message}
			</IntroText>
			{explanation && <Prose className="my-4 max-w-lg">{explanation}</Prose>}
			<Flex2 />
		</Centered>
	);
}

ErrorScreen.Icon = function () {
	return (
		<Centered className="justify-center text-2xl">
			<HiXCircle />
		</Centered>
	);
} as React.FC<ErrorScreenProps>;
ErrorScreen.Icon.displayName = 'ErrorScreen.Icon';

ErrorScreen.Widget = function ({ message }) {
	return (
		<Centered className="justify-center text-2xl">
			<HiXCircle className="text-red-800 dark:text-red-200" />
			<Prose>{message}</Prose>
		</Centered>
	);
} as React.FC<ErrorScreenProps>;
ErrorScreen.Widget.displayName = 'ErrorScreen.Widget';

type TranslatedProps = {
	namespace: string;
};

const Translated = elementTemplate<typeof ErrorScreen, TranslatedProps>(
	'Translated',
	ErrorScreen,
	(T) => <T />,
	{
		useProps({ namespace }) {
			const { t } = useTranslation(namespace);
			return { message: t('message'), explanation: t('explanation') };
		},
	},
);

ErrorScreen.translated = function translated(
	name: string,
	{ namespace }: TranslatedProps,
) {
	const result = Translated.extend<Record<string, never>>(name, (T) => <T />, {
		useProps: () => ({ namespace }),
	});
	return result.themed({
		// @ts-expect-error partial widget for template
		Icon: () => <ErrorScreen.Icon />,
		// @ts-expect-error partial widget for template
		Widget: () => <ErrorScreen.Widget />,
	});
};
