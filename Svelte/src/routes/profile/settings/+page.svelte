<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/utils/api';
	import { user as userStore } from '$lib/stores/auth';
	import { get } from 'svelte/store';
	import AvatarUploader from '$lib/components/AvatarUploader.svelte';

	let currentUser = get(userStore);
	let firstName = currentUser?.firstName || '';
	let lastName = currentUser?.lastName || '';
	let city = currentUser?.city || '';
	let age: number | '' = currentUser?.age ?? '';
	let timezone = currentUser?.timezone || '';
	let avatar = currentUser?.avatar || '';
	let error = '';
	let success = '';
	let loading = false;

	function validate(): string | null {
		if (firstName.length > 32) return 'Имя слишком длинное';
		if (lastName.length > 32) return 'Фамилия слишком длинная';
		if (city.length > 64) return 'Город слишком длинный';
		if (timezone.length > 64) return 'Таймзона слишком длинная';
		if (typeof age === 'number' && (age < 0 || age > 120)) return 'Некорректный возраст';
		return null;
	}

	async function handleSave() {
		error = '';
		success = '';
		const validationError = validate();
		if (validationError) {
			error = validationError;
			return;
		}
		loading = true;
		try {
			const payload: Record<string, any> = {
				firstName: firstName.trim() || undefined,
				lastName: lastName.trim() || undefined,
				city: city.trim() || undefined,
				age: age === '' ? undefined : Number(age),
				timezone: timezone.trim() || undefined,
				avatar: avatar || undefined
			};
			const res = await api.put('/api/users/me', payload);
			userStore.update((u) => (u ? { ...u, ...payload } : u));
			success = 'Профиль обновлён';
			setTimeout(() => goto('/profile'), 1000);
		} catch (e: any) {
			error = e?.data?.message || 'Ошибка сохранения';
		} finally {
			loading = false;
		}
	}

	function handleAvatarChange(e: CustomEvent<{ avatar: string }>) {
		avatar = e.detail.avatar;
	}

	function handleCancel() {
		goto('/profile');
	}
</script>

<div class="container mx-auto flex h-full items-center justify-center">
	<div class="card p-4 md:p-8 space-y-4 w-full max-w-md">
		<h2 class="h2 text-center">Настройки профиля</h2>
		<AvatarUploader avatarUrl={avatar} on:change={handleAvatarChange} />
		<label class="label">
			<span class="label-text">Имя</span>
			<input class="input" type="text" bind:value={firstName} maxlength="32" />
		</label>
		<label class="label">
			<span class="label-text">Фамилия</span>
			<input class="input" type="text" bind:value={lastName} maxlength="32" />
		</label>
		<label class="label">
			<span class="label-text">Город</span>
			<input class="input" type="text" bind:value={city} maxlength="64" />
		</label>
		<label class="label">
			<span class="label-text">Возраст</span>
			<input class="input" type="number" bind:value={age} min="0" max="120" />
		</label>
		<label class="label">
			<span class="label-text">Таймзона</span>
			<input class="input" type="text" bind:value={timezone} maxlength="64" />
		</label>
		{#if error}
			<div class="alert variant-filled-error">{error}</div>
		{/if}
		{#if success}
			<div class="alert variant-filled-success">{success}</div>
		{/if}
		<div class="flex gap-2">
			<button class="btn variant-filled-primary w-full" on:click={handleSave} disabled={loading}>
				{loading ? 'Сохранение...' : 'Сохранить'}
			</button>
			<button class="btn variant-ghost w-full" on:click={handleCancel} disabled={loading}>
				Отмена
			</button>
		</div>
	</div>
</div>
