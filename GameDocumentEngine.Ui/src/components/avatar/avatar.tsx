import { UserDetails } from '@/api/models/UserDetails';

export function Avatar({ user }: { user?: UserDetails }) {
	return (
		<img
			className="rounded-full overflow-hidden border border-gray-200 shadow w-10 h-10"
			src={user?.profilePhoto ?? '/user-circle.svg'}
		/>
	);
}
