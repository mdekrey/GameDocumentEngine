import type { UserDetails } from '@/api/models/UserDetails';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import { Avatar } from './avatar';
import { forwardRef } from 'react';

export const AvatarButton = forwardRef(function AvatarButton(
	{
		className,
		type,
		disabled,
		user,
		title,
		...props
	}: JSX.IntrinsicElements['button'] & { user?: UserDetails },
	ref: React.ForwardedRef<HTMLButtonElement>,
) {
	const { t } = useTranslation('avatar');
	return (
		<button
			className={twMerge(
				'inline-block rounded-md w-10 h-10 outline-blue-700 transition-colors',
				disabled && 'opacity-20',
				className,
			)}
			type={type ?? 'button'}
			title={title ?? user?.name ?? t('unknown-user')}
			{...props}
			ref={ref}
		>
			<Avatar user={user} />
		</button>
	);
});
