import { render, fireEvent } from '@testing-library/svelte';
import AvatarUploader from '$lib/components/AvatarUploader.svelte';

describe('AvatarUploader', () => {
	it('отображает аватар', () => {
		const { getByAltText } = render(AvatarUploader, {
			avatarUrl: 'https://example.com/avatar.png',
			token: 'token'
		});
		const img = getByAltText('avatar');
		expect(img).toBeTruthy();
		expect(img.getAttribute('src')).toContain('avatar.png');
	});

	it('вызывает on:change при загрузке', async () => {
		const { component, getByLabelText } = render(AvatarUploader, { avatarUrl: '', token: 'token' });
		const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
		const input = getByLabelText('Загрузить аватар') as HTMLInputElement;
		let changed = false;
		component.$on('change', () => (changed = true));
		await fireEvent.change(input, { target: { files: [file] } });
		expect(changed).toBe(true);
	});
});
