/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

// This was copied from the source of vite-plugin-dev-manifest
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import path from 'path';
import { Plugin, normalizePath } from 'vite';
import os from 'os';

/**
 * Resolve host if is passed as `true`
 *
 * Copied from https://github.com/vitejs/vite/blob/d4dcdd1ffaea79ecf8a9fc78cdbe311f0d801fb5/packages/vite/src/node/logger.ts#L197
 */
export function resolveHost(host?: string | boolean): string {
	if (!host) return 'localhost';

	if (host === true) {
		const nInterface = Object.values(os.networkInterfaces())
			.flatMap((nInterface) => nInterface ?? [])
			.filter(
				(detail) =>
					detail &&
					detail.address &&
					// Node < v18
					((typeof detail.family === 'string' && detail.family === 'IPv4') ||
						// Node >= v18
						(typeof detail.family === 'number' &&
							(detail as any).family === 4)),
			)
			.filter((detail) => {
				return detail.address !== '127.0.0.1';
			})[0];

		if (!nInterface) return 'localhost';

		return nInterface.address;
	}

	return host;
}

export interface ManifestPluginConfig {
	omitInputs?: string[];
	manifestName?: string;
	delay?: number;
	clearOnClose?: boolean;
}

export interface PluginManifest {
	[key: string]: { file: string };
}

const MANIFEST_NAME = 'manifest';

const createSimplifyPath = (root: string, base: string) => (path: string) => {
	path = normalizePath(path);

	if (root !== '/' && path.startsWith(root)) {
		path = path.slice(root.length);
	}

	if (path.startsWith(base)) {
		path = path.slice(base.length);
	}

	if (path[0] === '/') {
		path = path.slice(1);
	}

	return path;
};

const plugin = ({
	omitInputs = [],
	manifestName = MANIFEST_NAME,
	delay,
	clearOnClose = true,
}: ManifestPluginConfig = {}): Plugin => ({
	name: 'dev-manifest',
	enforce: 'post',

	configureServer(server) {
		const { config, httpServer } = server;

		if (!config.env.DEV || !config.build.manifest) {
			return;
		}

		httpServer?.once('listening', () => {
			const { root: _root, base } = config;
			const root = normalizePath(_root);
			const protocol = config.server.https ? 'https' : 'http';
			const host = resolveHost(config.server.host);
			const port = config.server.port;
			const manifest: PluginManifest = {};
			const inputOptions = config.build.rollupOptions?.input ?? {};
			const simplifyPath = createSimplifyPath(root, base);

			config.server.origin = `${protocol}://${host}:${port}`;

			if (typeof inputOptions === 'string') {
				manifest['main'] = { file: simplifyPath(inputOptions) };
			} else if (Array.isArray(inputOptions)) {
				for (const name of inputOptions) {
					if (omitInputs.includes(name)) continue;

					manifest[simplifyPath(name)] = { file: simplifyPath(name) };
				}
			} else {
				for (const [name, path] of Object.entries(inputOptions)) {
					if (omitInputs.includes(name)) continue;

					manifest[name] = { file: simplifyPath(path) };
				}
			}

			const outputDir = path.isAbsolute(config.build.outDir)
				? config.build.outDir
				: path.resolve(config.root, config.build.outDir);

			if (!existsSync(outputDir)) {
				mkdirSync(outputDir, { recursive: true });
			}

			const writeManifest = () => {
				writeFileSync(
					path.resolve(outputDir, `${manifestName}.json`),
					JSON.stringify(manifest, null, '\t'),
				);
			};

			if (delay !== undefined && typeof delay === 'number') {
				setTimeout(() => writeManifest(), delay);
			} else {
				writeManifest();
			}
		});

		httpServer?.once('close', () => {
			if (!clearOnClose) return;

			const outputDir = path.isAbsolute(config.build.outDir)
				? config.build.outDir
				: path.resolve(config.root, config.build.outDir);
			const manifestPath = path.resolve(outputDir, `${manifestName}.json`);

			if (existsSync(manifestPath)) rmSync(manifestPath);
		});
	},
});

export default plugin;
