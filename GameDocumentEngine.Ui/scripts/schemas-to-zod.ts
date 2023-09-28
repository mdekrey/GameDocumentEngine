import { glob } from 'glob';
import path from 'node:path';
import { writeFile, mkdir } from 'node:fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'node:module';
import { jsonSchemaToZodDereffed } from 'json-schema-to-zod';
import type { JSONSchema7 } from 'json-schema';

const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootPath = path.resolve(__dirname, '..');
const documentSchemaGlob = 'src/doc-types/*/schema.json';

const documentSchemaPaths = await glob(documentSchemaGlob, { cwd: rootPath });

await Promise.all(
	documentSchemaPaths.map(async (documentSchemaPath) => {
		const schemaPath = path.resolve(rootPath, documentSchemaPath);
		const outPath = path.resolve(path.dirname(schemaPath), 'schema.ts');
		const schema = require(schemaPath) as JSONSchema7;

		const module = await jsonSchemaToZodDereffed(schema);

		await new Promise((resolve) => mkdir(path.dirname(outPath), resolve));
		await new Promise((resolve, reject) =>
			writeFile(outPath, module, (err) => (err ? reject(err) : resolve(true))),
		);
		console.log(`wrote schema for ${documentSchemaPath}`);
	}),
);
