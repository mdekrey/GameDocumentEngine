import { toFetchApi } from "@principlestudios/openapi-codegen-typescript-fetch";
import operations from "@/api/operations";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const api = toFetchApi(operations, fetch, '/api');
