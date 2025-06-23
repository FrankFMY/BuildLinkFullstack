<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/utils/api';
	import { user as userStore } from '$lib/stores/auth';
	import { get } from 'svelte/store';
	import AvatarUploader from '$lib/components/AvatarUploader.svelte';
	import IMask from 'imask';
	import { onMount } from 'svelte';
	import cityTimezones from 'city-timezones';

	// Список российских городов с таймзонами
	const russianCities = [
		{ city: 'Москва', timezone: 'GMT+3' },
		{ city: 'Санкт-Петербург', timezone: 'GMT+3' },
		{ city: 'Новосибирск', timezone: 'GMT+7' },
		{ city: 'Екатеринбург', timezone: 'GMT+5' },
		{ city: 'Казань', timezone: 'GMT+3' },
		{ city: 'Нижний Новгород', timezone: 'GMT+3' },
		{ city: 'Челябинск', timezone: 'GMT+5' },
		{ city: 'Самара', timezone: 'GMT+4' },
		{ city: 'Омск', timezone: 'GMT+6' },
		{ city: 'Ростов-на-Дону', timezone: 'GMT+3' },
		{ city: 'Уфа', timezone: 'GMT+5' },
		{ city: 'Красноярск', timezone: 'GMT+7' },
		{ city: 'Воронеж', timezone: 'GMT+3' },
		{ city: 'Пермь', timezone: 'GMT+5' },
		{ city: 'Волгоград', timezone: 'GMT+3' },
		{ city: 'Саратов', timezone: 'GMT+4' },
		{ city: 'Владивосток', timezone: 'GMT+10' },
		{ city: 'Калининград', timezone: 'GMT+2' },
		{ city: 'Иркутск', timezone: 'GMT+8' },
		{ city: 'Хабаровск', timezone: 'GMT+10' }
	];

	let currentUser = get(userStore);
	let firstName = currentUser?.firstName || '';
	let lastName = currentUser?.lastName || '';
	let city = currentUser?.city || '';
	let age: number | '' = currentUser?.age ?? '';
	let timezone = currentUser?.timezone || '';
	let avatar = currentUser?.avatar || '';
	let phone = currentUser?.phone || '';
	let error = '';
	let success = '';
	let loading = false;
	let phoneInput: HTMLInputElement;
	let mask: any;
	let cityQuery = '';
	let citySuggestions = russianCities;
	let showSuggestions = false;

	const timezones = [
		'Europe/Moscow',
		'Europe/Saratov',
		'Asia/Novosibirsk',
		'Asia/Yekaterinburg',
		'Europe/Kaliningrad',
		'Asia/Vladivostok',
		'Asia/Krasnoyarsk',
		'Asia/Irkutsk',
		'Asia/Sakhalin',
		'Asia/Magadan',
		'Asia/Kamchatka'
	];

	function handlePhoneInput(e: Event) {
		phone = (e.target as HTMLInputElement).value;
	}

	function validate(): string | null {
		const digits = phone.replace(/\D/g, '');
		if (digits.length !== 11 || !digits.startsWith('7')) return 'Введите корректный номер телефона';
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
			const digits = phone.replace(/\D/g, '');
			const payload: Record<string, any> = {
				firstName: firstName.trim() || undefined,
				lastName: lastName.trim() || undefined,
				city: city.trim() || undefined,
				age: age === '' ? undefined : Number(age),
				timezone: timezone || undefined,
				avatar: avatar || undefined,
				phone: '+7' + digits.slice(-10)
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

	function onCityInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		cityQuery = value;
		city = value;

		if (value) {
			citySuggestions = russianCities.filter((item) =>
				item.city.toLowerCase().includes(value.toLowerCase())
			);
		} else {
			citySuggestions = russianCities;
		}
	}

	function selectCity(suggestion: { city: string; timezone: string }) {
		city = suggestion.city;
		timezone = suggestion.timezone;
		showSuggestions = false;
		citySuggestions = russianCities;
	}

	function onCityFocus() {
		showSuggestions = true;
		citySuggestions = russianCities;
	}

	function onCityBlur() {
		// Задержка чтобы успеть обработать клик по подсказке
		setTimeout(() => {
			showSuggestions = false;
		}, 200);
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
			<span class="label-text">Телефон</span>
			<input
				class="input"
				type="tel"
				bind:value={phone}
				bind:this={phoneInput}
				required
				placeholder="+7 (___) ___-__-__"
				maxlength="18"
				on:input={handlePhoneInput}
			/>
		</label>
		<label class="label">
			<span class="label-text">Город</span>
			<input
				class="input"
				type="text"
				bind:value={city}
				maxlength="64"
				on:input={onCityInput}
				on:focus={onCityFocus}
				on:blur={onCityBlur}
				placeholder="Начните вводить название города"
				autocomplete="off"
			/>
			{#if showSuggestions && citySuggestions.length > 0}
				<ul class="suggestions-list">
					{#each citySuggestions as suggestion}
						<li>
							<button
								type="button"
								class="suggestion-btn"
								on:click={() => selectCity(suggestion)}
								on:keydown={(e) => e.key === 'Enter' && selectCity(suggestion)}
								aria-label={`Выбрать город ${suggestion.city}`}
							>
								{suggestion.city} ({suggestion.timezone})
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</label>
		<label class="label">
			<span class="label-text">Возраст</span>
			<input class="input" type="number" bind:value={age} min="0" max="120" />
		</label>
		<label class="label">
			<span class="label-text">Таймзона</span>
			<input
				class="input"
				type="text"
				bind:value={timezone}
				readonly
				placeholder="Выберите город для определения таймзоны"
			/>
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

<style>
	.suggestions-list {
		background: #23223a;
		border: 1px solid #444;
		border-radius: 6px;
		margin: 0;
		padding: 0;
		position: absolute;
		z-index: 10;
		width: 100%;
		max-height: 180px;
		overflow-y: auto;
		box-shadow: 0 2px 8px #0002;
	}
	.suggestion-btn {
		background: none;
		border: none;
		width: 100%;
		text-align: left;
		padding: 0.5em 1em;
		cursor: pointer;
		color: inherit;
		font: inherit;
	}
	.suggestion-btn:hover,
	.suggestion-btn:focus {
		background: #181828;
		outline: none;
	}
</style>
