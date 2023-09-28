import type { z } from 'zod';
import { documentSchema } from '@/documents/defineDocument';
import folderScheam from './schema';

export type Folder = z.infer<typeof folderScheam>;
export const FolderDocument = documentSchema<Folder>(folderScheam);
export type FolderDocument = z.infer<typeof FolderDocument>;
