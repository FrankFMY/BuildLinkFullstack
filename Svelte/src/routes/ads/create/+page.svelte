<script lang="ts">
	import { api } from '$lib/utils/api';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/auth';
	import { get } from 'svelte/store';

	let title = '';
	let description = '';
	let price: number | '' = '';
	let error = '';
	let success = '';
	let loading = false;
	let amount: number | '' = 1;
	let paymentType: 'once' | 'day' | 'hour' | 'month' = 'once';

	async function createAd() {
		error = '';
		success = '';
		if (!title.trim() || !description.trim()) {
			error = 'Заполните все поля';
			return;
		}
		loading = true;
		try {
			const currentUser = get(user);
			let type: 'request' | 'offer' = 'request';
			if (currentUser?.role === 'seller') type = 'offer';
			if (currentUser?.role === 'client') type = 'request';
			if (currentUser?.role === 'both') type = 'offer'; // по умолчанию для both — offer
			await api.post('/api/ads', {
				title,
				description,
				price: price ? Number(price) : 0,
				type,
				amount: amount ? Number(amount) : 1,
				paymentType
			});
			success = 'Объявление создано';
			setTimeout(() => goto('/'), 1000);
		} catch (e: any) {
			error = e?.data?.message || 'Ошибка создания';
		} finally {
			loading = false;
		}
	}
</script>

<div class="container mx-auto flex h-full items-center justify-center">
	<div class="card p-4 md:p-8 space-y-4 w-full max-w-md">
		<h2 class="h2 text-center">Создать объявление</h2>

		<label class="label">
			<span class="label-text">Заголовок</span>
			<input
				class="input"
				type="text"
				bind:value={title}
				placeholder="Введите заголовок"
				maxlength="128"
				required
				aria-label="Заголовок объявления"
			/>
		</label>
		<label class="label">
			<span class="label-text">Описание</span>
			<textarea
				class="textarea"
				bind:value={description}
				placeholder="Введите описание"
				maxlength="1024"
				required
				aria-label="Описание объявления"
			></textarea>
		</label>
		<label class="label">
			<span class="label-text">Цена</span>
			<input
				class="input"
				type="number"
				bind:value={price}
				placeholder="0"
				min="0"
				aria-label="Цена объявления"
			/>
		</label>
		<label class="label">
			<span class="label-text">Количество</span>
			<input
				class="input"
				type="number"
				bind:value={amount}
				placeholder="1"
				min="1"
				required
				aria-label="Количество"
			/>
		</label>
		<label class="label">
			<span class="label-text">Тип оплаты</span>
			<select class="input" bind:value={paymentType} aria-label="Тип оплаты" required>
				<option value="once">Разово</option>
				<option value="day">В день</option>
				<option value="hour">В час</option>
				<option value="month">В месяц</option>
			</select>
		</label>

		{#if error}
			<div class="alert variant-filled-error">{error}</div>
		{/if}
		{#if success}
			<div class="alert variant-filled-success">{success}</div>
		{/if}

		<button
			class="btn variant-filled-primary w-full"
			type="submit"
			on:click={createAd}
			disabled={loading}
			aria-label="Создать объявление"
		>
			{loading ? 'Создание...' : 'Создать'}
		</button>
	</div>
</div>
