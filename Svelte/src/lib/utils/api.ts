import { authToken } from '$lib/stores/auth';
import { get } from 'svelte/store';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!BASE_URL) throw new Error('VITE_API_BASE_URL is not set');

async function send(method: string, path: string, data?: Record<string, unknown>) {
	const opts: RequestInit = { method, headers: {} };

	if (data) {
		(opts.headers as Record<string, string>)['Content-Type'] = 'application/json';
		opts.body = JSON.stringify(data);
	}

	const token = get(authToken);
	if (token) {
		(opts.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
	}

	const res = await fetch(`${BASE_URL}${path}`, opts);

	if (res.ok) {
		return res.status === 204 ? {} : res.json();
	}

	const errorData = await res
		.json()
		.catch(() => ({ message: 'Ошибка при обработке ответа сервера' }));
	throw { status: res.status, data: errorData };
}

export const api = {
	get: (url: string) => send('GET', url),
	post: (url: string, data: Record<string, unknown>) => send('POST', url, data),
	put: (url: string, data: Record<string, unknown>) => send('PUT', url, data),
	delete: (url: string) => send('DELETE', url)
};
