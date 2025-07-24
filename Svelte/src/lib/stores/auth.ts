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
	avatar?: string;
	phone?: string;
	city?: string;
	timezone?: string;
	role?: 'client' | 'seller' | 'both';
	firstName?: string;
	lastName?: string;
	age?: number;
}

export interface Ad {
	id: string;
	title: string;
	description: string;
	price: number;
	author: string;
	authorId?: string;
	created_at: string;
	photos?: string[];
}

export type ApiError = { data?: { error?: string; message?: string }; message?: string };

// Функция для загрузки профиля пользователя
export async function loadUserProfile() {
	try {
		const profile = await api.get('/api/auth/me');
		if (profile && profile._id) {
			// Преобразуем _id в id для совместимости
			const userProfile = {
				...profile,
				id: profile._id,
				// Устанавливаем роль по умолчанию, если её нет
				role: profile.role || 'client'
			};
			// Обрабатываем avatar
			if ('avatar' in userProfile && userProfile.avatar === null) userProfile.avatar = undefined;
			user.set(userProfile);
			return userProfile;
		}
	} catch (error) {
		console.error('Ошибка загрузки профиля пользователя:', error);
		// Если токен недействителен, очищаем данные
		logout();
	}
	return null;
}

// Начальное состояние
const initialToken = isBrowser ? localStorage.getItem('jwt_token') : null;
const initialUser = isBrowser
	? (() => {
			const raw = localStorage.getItem('user_profile');
			if (!raw) return null;
			const parsed = JSON.parse(raw);
			if (!('role' in parsed)) parsed.role = 'client';
			if ('avatar' in parsed && parsed.avatar === null) parsed.avatar = undefined;
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
			const toSave = { ...value };
			if ('avatar' in toSave && toSave.avatar === null) toSave.avatar = undefined;
			localStorage.setItem('user_profile', JSON.stringify(toSave));
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

// Инициализация: загружаем профиль пользователя, если есть токен
if (isBrowser && initialToken && !initialUser) {
	loadUserProfile();
}
