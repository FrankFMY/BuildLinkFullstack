import { render, fireEvent } from '@testing-library/svelte';
import UserMenu from '$lib/components/UserMenu.svelte';
import { user, authToken } from '$lib/stores/auth';

describe('UserMenu', () => {
	beforeEach(() => {
		user.set({
			id: '1',
			email: 'test@mail.com',
			username: 'tester',
			created_at: '',
			avatar: 'https://example.com/avatar.png'
		});
		authToken.set('token');
	});

	it('отображает username', () => {
		const { getByText } = render(UserMenu);
		expect(getByText('Привет, tester')).toBeInTheDocument();
	});

	it('отображает аватар', () => {
		const { container } = render(UserMenu);
		const img = container.querySelector('img.avatar-mini');
		expect(img).toBeTruthy();
		expect(img?.getAttribute('src')).toContain('avatar.png');
	});

	it('открывает меню по клику', async () => {
		const { getByRole, queryByText } = render(UserMenu);
		const btn = getByRole('button');
		expect(queryByText('Выйти')).toBeNull();
		await fireEvent.click(btn);
		expect(queryByText('Выйти')).toBeInTheDocument();
	});
});
