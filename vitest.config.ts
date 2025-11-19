import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		reporters: ['tree'],
		coverage: {
			provider: 'v8',
			reporter: ['text'],
			include: ['src/**'],
		},
		clearMocks: true,
		mockReset: true,
		unstubEnvs: true,
		setupFiles: [],
	},
});
