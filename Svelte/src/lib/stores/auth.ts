import { writable, derived } from 'svelte/store';
// import { browser } from '$app/environment';
import { api } from '$lib/utils/api';

const isBrowser = typeof window !== 'undefined';

// Тип для данных пользователя
export interface UserProfile {
	id: string;
	email: string;
	username: string;
	created_at: string;
	role?: 'client' | 'seller' | 'both';
}

// Начальное состояние
const initialToken = isBrowser ? localStorage.getItem('jwt_token') : null;
const initialUser = isBrowser
	? (() => {
			const raw = localStorage.getItem('user_profile');
			if (!raw) return null;
			const parsed = JSON.parse(raw);
			if (!('role' in parsed)) parsed.role = 'client';
			return parsed;
		})()
	: null;

// Создаем сторы
export const authToken = writable<string | null>(initialToken);
export const user = writable<UserProfile | null>(initialUser);

export const isAuthenticated = derived(authToken, ($authToken) => !!$authToken);

// Синхронизация с localStorage
authToken.subscribe((value) => {
	if (isBrowser) {
		if (value) {
			localStorage.setItem('jwt_token', value);
		} else {
			localStorage.removeItem('jwt_token');
		}
	}
});

user.subscribe((value) => {
	if (isBrowser) {
		if (value) {
			localStorage.setItem('user_profile', JSON.stringify(value));
		} else {
			localStorage.removeItem('user_profile');
		}
	}
});

export function logout() {
	authToken.set(null);
	user.set(null);
}

export async function changeRole(newRole: 'client' | 'seller' | 'both') {
	const res = await api.put('/api/users/me/role', { role: newRole });
	user.update((u) => (u ? { ...u, role: res.role } : u));
}
