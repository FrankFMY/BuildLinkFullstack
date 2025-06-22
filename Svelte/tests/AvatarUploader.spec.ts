import { render, fireEvent } from '@testing-library/svelte';
import AvatarUploader from '$lib/components/AvatarUploader.svelte';
import { vi, type Mock } from 'vitest';

// Мокаем fetch
global.fetch = vi.fn(() =>
	Promise.resolve({
		ok: true,
		json: () => Promise.resolve({ avatar: 'https://new-avatar.com/img.png' })
	} as Response)
);

describe('AvatarUploader', () => {
	beforeEach(() => {
		(global.fetch as Mock).mockClear();
	});

	it('отображает аватар', () => {
		const { getByAltText } = render(AvatarUploader, {
			avatarUrl: 'https://example.com/avatar.png',
			token: 'token'
		});
		const img = getByAltText('avatar preview');
		expect(img).toBeTruthy();
		expect(img.getAttribute('src')).toContain('avatar.png');
	});

	it('вызывает on:change при загрузке', async () => {
		const { component, container } = render(AvatarUploader, { avatarUrl: '', token: 'token' });
		const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });

		const input = container.querySelector('input[type="file"]') as HTMLInputElement;

		let changed = false;
		component.$on('change', () => (changed = true));

		await fireEvent.change(input, { target: { files: [file] } });

		await new Promise((resolve) => setTimeout(resolve, 100)); // wait for api mock

		expect(changed).toBe(true);
		expect(global.fetch).toHaveBeenCalled();
	});
});
