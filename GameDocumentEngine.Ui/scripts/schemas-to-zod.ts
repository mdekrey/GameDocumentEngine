import { glob } from 'glob';
import path from 'node:path';
import { writeFile, mkdir } from 'node:fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'node:module';
import { jsonSchemaToZod } from 'json-schema-to-zod';
import type { JSONSchema7 } from 'json-schema';

const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const documentSchemaDir = path.resolve(__dirname, '../../schemas/documents');
const documentsDir = path.resolve(__dirname, '../src/documents');

const schemaExtension = '.json';

const documentTypes = (
	await glob(`*${schemaExtension}`, { cwd: documentSchemaDir })
).map((file) => file.substring(0, file.length - schemaExtension.length));

await Promise.all(
	documentTypes.map(async (documentType) => {
		const schemaPath = path.resolve(
			documentSchemaDir,
			`${documentType}${schemaExtension}`,
		);
		const outPath = path.resolve(documentsDir, documentType, 'schema.ts');
		const schema = require(schemaPath) as JSONSchema7;

		const module = jsonSchemaToZod(schema);

		await new Promise((resolve) => mkdir(path.dirname(outPath), resolve));
		await new Promise((resolve, reject) =>
			writeFile(outPath, module, (err) => (err ? reject(err) : resolve(true))),
		);
		console.log(`wrote schema for ${documentType}`);
	}),
);
