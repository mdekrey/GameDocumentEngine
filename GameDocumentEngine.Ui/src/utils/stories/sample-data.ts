import type { UserDetails } from '@vaultvtt/api/openapi/models/UserDetails';
import { faker } from '@faker-js/faker';

export function randomUser(): UserDetails {
	return {
		id: faker.string.uuid(),
		name: faker.person.fullName(),
		profilePhoto: faker.image.avatar(),
		options: {},
	};
}
export const sampleUser: UserDetails = randomUser();
