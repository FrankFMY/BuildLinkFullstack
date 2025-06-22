import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit(), purgeCss()],
	test: {
		globals: true,
		environment: 'jsdom',
		include: ['tests/**/*.{test,spec}.{js,ts}'],
		exclude: [
			'**/node_modules/**',
			'**/dist/**',
			'tests/ad-flow.spec.ts',
			'tests/auth.spec.ts',
			'tests/profile.spec.ts',
			'tests/sanity.spec.ts'
		],
		setupFiles: ['tests/setup.ts']
	}
});
