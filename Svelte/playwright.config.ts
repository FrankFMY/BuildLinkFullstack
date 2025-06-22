import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
<<<<<<< HEAD
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		env: {
			VITE_API_BASE_URL: 'http://localhost:3000'
		}
	},
	testDir: 'tests',
	testMatch: /.*(auth|ad-flow)\.spec\.ts/
=======
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
>>>>>>> 1753bb79a3f92980ba2e1e275056c0235d9e2326
};

export default config;
