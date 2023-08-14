import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { globSync } from 'glob';
import { VitePWA } from 'vite-plugin-pwa';

const commonDependencies: [string, string][] = [
	// ['react/', 'react'],
	// ['react-router-dom', 'react'],
	// ['react-dom', 'react'],
	// ['react-i18next', 'react'],
	// ['react-router', 'react'],
	// ['@remix-run/router', 'react'],
	// ['@headlessui/react', 'react'],
	// ['@tanstack', 'react'],
	// ['jotai', 'react'],
	// ['i18next', 'common'],
	// ['tailwind-merge', 'common'],
	// ['immer', 'common'],
	// ['rfc6902', 'common'],
	// ['zod', 'common'],
	// ['@microsoft/signalr', 'common'],
	// ['date-fns', 'common'],
	// ['@babel/runtime', 'common'],
	['d3', 'd3'],
	['react-icons', 'react-icons'],
];

const nodeModulesRoot = path
	.resolve(__dirname, 'node_modules')
	.replace(/\\/g, '/');

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		splitVendorChunkPlugin(),
		VitePWA({
			registerType: 'autoUpdate',
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'vtt-sw.ts',
			manifest: {
				name: 'vtt',
				short_name: 'vtt',
			},
		}),
	],
	build: {
		outDir: '../GameDocumentEngine.Server/wwwroot',
		emptyOutDir: true,
		rollupOptions: {
			input: ['./index.html', ...globSync('./src/documents/*/index.ts')],
			output: {
				manualChunks(id) {
					if (!id.startsWith(nodeModulesRoot)) {
						return;
					}
					const remaining = id.substring(nodeModulesRoot.length + 1);

					const foundPackage = commonDependencies.find(([key]) =>
						remaining.startsWith(key),
					);
					if (foundPackage) return foundPackage[1];

					// const parts = remaining.split('/');
					// const significant = remaining.startsWith('@')
					// 	? parts.slice(0, 2).join('/')
					// 	: parts[0];
					// console.log(significant);

					return;
				},
			},
		},
		manifest: true,
		reportCompressedSize: false,
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
