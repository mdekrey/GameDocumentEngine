import { type CreateDocumentDetails } from '@vaultvtt/api/openapi/models/CreateDocumentDetails';
import { z } from 'zod';

export const createDocumentDetailsSchema = z.object({
	name: z.string().min(1),
	type: z.string().min(1),
	folderId: z.string().nullable(),
	initialRoles: z.record(z.string()),
	details: z.object({}).passthrough(),
}) satisfies z.ZodType<Omit<CreateDocumentDetails, 'details'>>;
