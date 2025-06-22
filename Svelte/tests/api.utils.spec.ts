import { api } from '$lib/utils/api';
import { authToken } from '$lib/stores/auth';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock as MockType } from 'vitest';

beforeEach(() => {
	authToken.set(null);
	global.fetch = vi.fn();
});

describe('api utils', () => {
	it('get формирует правильный URL', async () => {
		(fetch as unknown as MockType).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: 1 }),
			status: 200
		});
		const res = await api.get('/test');
		expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/test'), expect.any(Object));
		expect(res).toEqual({ data: 1 });
	});

	it('подставляет токен авторизации', async () => {
		authToken.set('jwt');
		(fetch as unknown as MockType).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({}),
			status: 200
		});
		await api.get('/test');
		const opts = (fetch as unknown as MockType).mock.calls[0][1] as {
			headers: { Authorization: string };
		};
		expect(opts.headers.Authorization).toBe('Bearer jwt');
	});

	it('обрабатывает ошибку ответа', async () => {
		(fetch as unknown as MockType).mockResolvedValue({
			ok: false,
			status: 400,
			json: () => Promise.resolve({ message: 'fail' })
		});
		await expect(api.get('/fail')).rejects.toMatchObject({
			status: 400,
			data: { message: 'fail' }
		});
	});
});
