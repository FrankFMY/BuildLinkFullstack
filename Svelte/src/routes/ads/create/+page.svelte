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
	let photos: File[] = [];
	let photoPreviews: string[] = [];

	function handlePhotoChange(e: Event) {
		const files = (e.target as HTMLInputElement).files;
		if (!files) return;
		const arr = Array.from(files).slice(0, 6 - photos.length);
		photos = [...photos, ...arr].slice(0, 6);
		photoPreviews = photos.map((file) => URL.createObjectURL(file));
	}
	function removePhoto(idx: number) {
		photos.splice(idx, 1);
		photoPreviews.splice(idx, 1);
		photos = [...photos];
		photoPreviews = [...photoPreviews];
	}

	function setMainPhoto(idx: number) {
		if (idx === 0) return;
		const newMain = photos[idx];
		photos.splice(idx, 1);
		photos.unshift(newMain);
		photoPreviews.splice(idx, 1);
		photoPreviews.unshift(URL.createObjectURL(newMain));
		photos = [...photos];
		photoPreviews = [...photoPreviews];
	}

	async function createAd() {
		error = '';
		success = '';
		if (!title.trim() || !description.trim()) {
			error = 'Заполните все поля';
			return;
		}
		loading = true;
		try {
			const currentUser = get(user) as { role?: string };
			let type: 'request' | 'offer' = 'request';
			if (currentUser?.role === 'seller') type = 'offer';
			if (currentUser?.role === 'client') type = 'request';
			if (currentUser?.role === 'both') type = 'offer'; // по умолчанию для both — offer
			const ad = await api.post('/api/ads', {
				title,
				description,
				price: price ? Number(price) : 0,
				type,
				amount: amount ? Number(amount) : 1,
				paymentType
			});
			if (ad && ad.id && photos.length > 0) {
				const form = new FormData();
				photos.forEach((file) => form.append('photos', file));
				await api.post(`/api/ads/${ad.id}/photos`, form);
			}
			success = 'Объявление создано';
			setTimeout(() => goto(`/ads/${ad.id}`), 1000);
		} catch (e: unknown) {
			const err = e as { data?: { message?: string } };
			error = err?.data?.message || 'Ошибка создания';
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
		<label class="label">
			<span class="label-text">Фото (до 6)</span>
			<input type="file" accept="image/*" multiple on:change={handlePhotoChange} />
			<div class="flex gap-2 mt-2 flex-wrap">
				{#each photoPreviews as url, idx}
					<div class="relative group">
						<img
							src={url}
							alt="Фото"
							class="w-20 h-20 object-cover rounded shadow {idx === 0
								? 'ring-4 ring-blue-500'
								: ''}"
						/>
						{#if idx !== 0}
							<button
								type="button"
								class="absolute bottom-1 left-1 bg-blue-600 text-white rounded px-1 py-0.5 text-xs opacity-80 hover:opacity-100"
								on:click={() => setMainPhoto(idx)}>Сделать главным</button
							>
						{/if}
						<button
							type="button"
							class="absolute top-0 right-0 bg-black/60 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition"
							on:click={() => removePhoto(idx)}>×</button
						>
					</div>
				{/each}
			</div>
			<div class="text-xs text-surface-400 mt-1">Главное фото выделено синим</div>
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
