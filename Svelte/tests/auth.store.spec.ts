import { authToken, user, isAuthenticated, logout } from '$lib/stores/auth';
import { get } from 'svelte/store';

describe('auth store', () => {
	beforeEach(() => {
		authToken.set(null);
		user.set(null);
	});

	it('начальное состояние: не авторизован', () => {
		expect(get(authToken)).toBeNull();
		expect(get(user)).toBeNull();
		expect(get(isAuthenticated)).toBe(false);
	});

	it('установка токена и пользователя', () => {
		authToken.set('token123');
		user.set({ id: '1', email: 'a@b.c', username: 'u', created_at: 'now' });
		expect(get(authToken)).toBe('token123');
		expect(get(user)).toEqual({ id: '1', email: 'a@b.c', username: 'u', created_at: 'now' });
		expect(get(isAuthenticated)).toBe(true);
	});

	it('logout сбрасывает токен и пользователя', () => {
		authToken.set('token123');
		user.set({ id: '1', email: 'a@b.c', username: 'u', created_at: 'now' });
		logout();
		expect(get(authToken)).toBeNull();
		expect(get(user)).toBeNull();
		expect(get(isAuthenticated)).toBe(false);
	});
});
