import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		env: {
			VITE_API_BASE_URL: 'http://localhost:3000'
		}
	},
	testDir: 'tests',
	testMatch: /.*(auth|ad-flow)\.spec\.ts/
};

export default config;
