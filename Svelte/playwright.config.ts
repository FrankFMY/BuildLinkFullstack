import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	testDir: 'tests',
	testMatch: '*.spec.pw.ts',
	use: {
		baseURL: 'http://localhost:5173'
	},
	webServer: {
		command: 'npm run dev',
		port: 5173,
		reuseExistingServer: !process.env.CI
	},
	timeout: 60000,
	expect: {
		timeout: 10000
	}
};

export default config;
