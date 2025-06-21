import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Тип для данных пользователя
export interface UserProfile {
	id: string;
	email: string;
	username: string;
	created_at: string;
}

// Начальное состояние
const initialToken = browser ? localStorage.getItem('jwt_token') : null;
const initialUser = browser ? JSON.parse(localStorage.getItem('user_profile') || 'null') : null;

// Создаем сторы
export const authToken = writable<string | null>(initialToken);
export const user = writable<UserProfile | null>(initialUser);

export const isAuthenticated = derived(authToken, ($authToken) => !!$authToken);

// Синхронизация с localStorage
authToken.subscribe((value) => {
	if (browser) {
		if (value) {
			localStorage.setItem('jwt_token', value);
		} else {
			localStorage.removeItem('jwt_token');
		}
	}
});

user.subscribe((value) => {
	if (browser) {
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
