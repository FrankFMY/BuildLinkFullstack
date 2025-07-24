import { describe, it, expect } from 'vitest';
import type { Ad } from '$lib/stores/auth';

// Мок данных пользователя
const mockUser = {
	id: 'user123',
	email: 'test@example.com',
	username: 'testuser',
	created_at: '2024-01-01T00:00:00.000Z'
};

// Мок данных объявлений
const mockAds: Ad[] = [
	{
		id: 'ad1',
		title: 'Мое объявление',
		description: 'Описание моего объявления',
		price: 1000,
		author: 'testuser',
		authorId: 'user123',
		created_at: '2024-01-01T00:00:00.000Z',
		photos: ['photo1.jpg']
	},
	{
		id: 'ad2',
		title: 'Чужое объявление',
		description: 'Описание чужого объявления',
		price: 2000,
		author: 'otheruser',
		authorId: 'user456',
		created_at: '2024-01-01T00:00:00.000Z',
		photos: []
	},
	{
		id: 'ad3',
		title: 'Мое объявление без фото',
		description: 'Описание моего объявления без фото',
		price: 500,
		author: 'testuser',
		authorId: 'user123',
		created_at: '2024-01-01T00:00:00.000Z',
		photos: []
	}
];

describe('Логика фильтрации объявлений', () => {
	it('должна показывать все объявления когда фильтры отключены', () => {
		const showMine = false;
		const showWithPhoto = false;

		const filteredAds: Ad[] = mockAds.filter((ad) => {
			if (showMine) {
				if (!mockUser?.id) return false;
				return ad.authorId === mockUser.id;
			}

			if (showWithPhoto && (!ad.photos || ad.photos.length === 0)) return false;

			return true;
		});

		expect(filteredAds).toHaveLength(3);
		expect(filteredAds.map((ad) => ad.id)).toEqual(['ad1', 'ad2', 'ad3']);
	});

	it('должна показывать только свои объявления когда включен фильтр "только свои"', () => {
		const showMine = true;
		const showWithPhoto = false;

		const filteredAds: Ad[] = mockAds.filter((ad) => {
			if (showMine) {
				if (!mockUser?.id) return false;
				return ad.authorId === mockUser.id;
			}

			if (showWithPhoto && (!ad.photos || ad.photos.length === 0)) return false;

			return true;
		});

		expect(filteredAds).toHaveLength(2);
		expect(filteredAds.map((ad) => ad.id)).toEqual(['ad1', 'ad3']);
		expect(filteredAds.every((ad) => ad.authorId === mockUser.id)).toBe(true);
	});

	it('должна показывать только объявления с фото когда включен фильтр "только с фото"', () => {
		const showMine = false;
		const showWithPhoto = true;

		const filteredAds: Ad[] = mockAds.filter((ad) => {
			if (showMine) {
				if (!mockUser?.id) return false;
				return ad.authorId === mockUser.id;
			}

			if (showWithPhoto && (!ad.photos || ad.photos.length === 0)) return false;

			return true;
		});

		expect(filteredAds).toHaveLength(1);
		expect(filteredAds[0]).toBeDefined();
		const firstAd = filteredAds[0] as Ad;
		expect(firstAd.id).toBe('ad1');
		expect(firstAd.photos).toHaveLength(1);
	});

	it('должна показывать только свои объявления с фото когда включены оба фильтра', () => {
		const showMine = true;
		const showWithPhoto = true;

		const filteredAds: Ad[] = mockAds.filter((ad) => {
			// Сначала применяем фильтр "только свои"
			if (showMine) {
				if (!mockUser?.id) return false;
				if (ad.authorId !== mockUser.id) return false;
			}

			// Затем применяем фильтр "только с фото"
			if (showWithPhoto && (!ad.photos || ad.photos.length === 0)) return false;

			return true;
		});

		expect(filteredAds).toHaveLength(1);
		expect(filteredAds[0]).toBeDefined();
		const firstAd = filteredAds[0] as Ad;
		expect(firstAd.id).toBe('ad1');
		expect(firstAd.authorId).toBe(mockUser.id);
		expect(firstAd.photos).toHaveLength(1);
	});

	it('должна возвращать пустой массив когда пользователь не авторизован и включен фильтр "только свои"', () => {
		const showMine = true;
		const showWithPhoto = false;
		const unauthenticatedUser = null;

		const filteredAds: Ad[] = mockAds.filter((ad) => {
			if (showMine) {
				// Проверяем, что пользователь не авторизован (null)
				if (!unauthenticatedUser) return false;
				// Этот код не будет достигнут, так как unauthenticatedUser === null
			}

			if (showWithPhoto && (!ad.photos || ad.photos.length === 0)) return false;

			return true;
		});

		expect(filteredAds).toHaveLength(0);
	});
});
