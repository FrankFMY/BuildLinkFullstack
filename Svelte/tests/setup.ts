import '@testing-library/jest-dom';
/*
import { vi } from 'vitest';

vi.mock('$lib/utils/api', () => {
	return {
		api: {
			get: vi.fn(),
			post: vi.fn((url, data, token) => {
				if (url.includes('/users/me/avatar')) {
					return Promise.resolve({ avatar: 'https://new-avatar.com/img.png' });
				}
				return Promise.resolve({});
			}),
			put: vi.fn(),
			delete: vi.fn(() => Promise.resolve({ message: 'Удалено' }))
		}
	};
});
*/
