import { authToken } from '$lib/stores/auth';
import { get } from 'svelte/store';

const BASE_URL =
	(typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
	process.env.VITE_API_BASE_URL ||
	'http://localhost:8000';
if (!BASE_URL) throw new Error('VITE_API_BASE_URL is not set');

async function send(
	method: string,
	path: string,
	data?: Record<string, unknown> | FormData,
	token?: string
) {
	const opts: RequestInit = { method, headers: {} };

	if (data) {
		if (data instanceof FormData) {
			opts.body = data;
		} else {
			(opts.headers as Record<string, string>)['Content-Type'] = 'application/json';
			opts.body = JSON.stringify(data);
		}
	}

	const auth = token || get(authToken);
	if (auth) {
		(opts.headers as Record<string, string>)['Authorization'] = `Bearer ${auth}`;
	}

	let url = path;
	if (BASE_URL.endsWith('/api') && path.startsWith('/api/')) {
		url = path.replace(/^\/api/, '');
	}

	const res = await fetch(`${BASE_URL}${url}`, opts);

	if (res.ok) {
		return res.status === 204 ? {} : res.json();
	}

	const errorData: { message?: string; error?: string } = await res
		.json()
		.catch(() => ({ message: 'Ошибка при обработке ответа сервера' }));
	throw { status: res.status, data: errorData };
}

export const api = {
	/**
	 * GET-запрос
	 * @param {string} url
	 * @param {string} [token]
	 */
	get: (url: string, token?: string) => send('GET', url, undefined, token),
	/**
	 * POST-запрос
	 * @param {string} url
	 * @param {Record<string, unknown> | FormData} data
	 * @param {string} [token]
	 */
	post: (url: string, data: Record<string, unknown> | FormData, token?: string) =>
		send('POST', url, data, token),
	/**
	 * PUT-запрос
	 * @param {string} url
	 * @param {Record<string, unknown> | FormData} data
	 * @param {string} [token]
	 */
	put: (url: string, data: Record<string, unknown> | FormData, token?: string) =>
		send('PUT', url, data, token),
	/**
	 * DELETE-запрос
	 * @param {string} url
	 * @param {string} [token]
	 */
	delete: (url: string, token?: string) => send('DELETE', url, undefined, token)
};
