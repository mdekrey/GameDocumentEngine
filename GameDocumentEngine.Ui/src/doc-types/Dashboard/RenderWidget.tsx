import { Suspense } from 'react';
import { LimitingInset } from '@/doc-types/Dashboard/Inset';
import { useDocTypeTranslation } from '@/utils/api/hooks';
import { ErrorScreen } from '@/components/errors';
import { ErrorBoundary } from '@/components/error-boundary/error-boundary';

export function RenderWidget({
	widget,
	errorKey,
}: {
	widget: React.ReactNode;
	errorKey: React.Key;
}) {
	const t = useDocTypeTranslation('Dashboard');
	return (
		<LimitingInset>
			<ErrorBoundary
				errorKey={errorKey}
				fallback={<ErrorScreen message={t('widgets.widget-runtime-error')} />}
			>
				<Suspense>{widget}</Suspense>
			</ErrorBoundary>
		</LimitingInset>
	);
}
