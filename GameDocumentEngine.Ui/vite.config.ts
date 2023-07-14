import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { globSync } from 'glob';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), splitVendorChunkPlugin()],
	build: {
		outDir: '../GameDocumentEngine.Server/wwwroot',
		rollupOptions: {
			input: ['./index.html', ...globSync('./src/documents/*/index.ts')],
		},
		manifest: true,
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
