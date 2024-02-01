import type { UserDetails } from '@vaultvtt/api/openapi/models/UserDetails';

export function Avatar({ user }: { user?: UserDetails }) {
	return (
		<img
			className="rounded-md overflow-hidden shadow w-10 h-10"
			src={user?.profilePhoto ?? '/user-circle.svg'}
		/>
	);
}
